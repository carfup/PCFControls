import * as React from 'react';
import { DatePicker, IDatePickerStrings } from '@fluentui/react/lib/DatePicker';
import { Stack } from '@fluentui/react/lib/Stack';
import { Label } from '@fluentui/react/lib/Label';
import { IComboBoxOption, ComboBox, IComboBox } from '@fluentui/react/lib/ComboBox';
import { DataFieldDefinition } from "../EntitiesDefinition";

const availableTimes: IComboBoxOption[] = [
  { key: '24:00', text: '24:00' },
  { key: '24:30', text: '24:30' },
  { key: '01:00', text: '01:00' },
  { key: '01:30', text: '01:30' },
  { key: '02:00', text: '02:00' },
  { key: '02:30', text: '02:30' },
  { key: '03:00', text: '03:00' },
  { key: '03:30', text: '03:30' },
  { key: '04:00', text: '04:00' },
  { key: '04:30', text: '04:30' },
  { key: '05:00', text: '05:00' },
  { key: '05:30', text: '05:30' },
  { key: '06:00', text: '06:00' },
  { key: '06:30', text: '06:30' },
  { key: '07:00', text: '07:00' },
  { key: '07:30', text: '07:30' },
  { key: '08:00', text: '08:00' },
  { key: '08:30', text: '08:30' },
  { key: '09:00', text: '09:00' },
  { key: '09:30', text: '09:30' },
  { key: '10:00', text: '10:00' },
  { key: '10:30', text: '10:30' },
  { key: '11:00', text: '11:00' },
  { key: '11:30', text: '11:30' },
  { key: '12:00', text: '12:00' },
  { key: '12:30', text: '12:30' },
  { key: '13:00', text: '13:00' },
  { key: '13:30', text: '13:30' },
  { key: '14:00', text: '14:00' },
  { key: '14:30', text: '14:30' },
  { key: '15:00', text: '15:00' },
  { key: '15:30', text: '15:30' },
  { key: '16:00', text: '16:00' },
  { key: '16:30', text: '16:30' },
  { key: '17:00', text: '17:00' },
  { key: '17:30', text: '17:30' },
  { key: '18:00', text: '18:00' },
  { key: '18:30', text: '18:30' },
  { key: '19:00', text: '19:00' },
  { key: '19:30', text: '19:30' },
  { key: '20:00', text: '20:00' },
  { key: '20:30', text: '20:30' },
  { key: '21:00', text: '21:00' },
  { key: '21:30', text: '21:30' },
  { key: '22:00', text: '22:00' },
  { key: '22:30', text: '22:30' },
  { key: '23:00', text: '23:00' },
  { key: '23:30', text: '23:30' },
];


export interface IDatePickerState {
  //firstDayOfWeek?: DayOfWeek;
  fieldDefinition? : DataFieldDefinition;
}

interface IDatePickerProperties {
  fieldDefinition: DataFieldDefinition;
  onDateChanged: (dataFieldDefinition? :DataFieldDefinition) => void;
  label : string;
  dateFormat : (date? : Date | undefined) => string;
  disabled? : boolean;
  showTime: boolean;
  width : number;
}

export default class DatePickerControl extends React.Component<IDatePickerProperties,IDatePickerState> {

    constructor(props: IDatePickerProperties) {
      super(props);
      this.state = {
          fieldDefinition: this.props.fieldDefinition,
      };
  }

  public render() {
    
    return (
      <Stack horizontal  styles={{root : {
        paddingBottom: "3.5px", paddingTop:"3.5px", borderBottom: "1px solid rgb(216, 216, 216)"
        }}}>
        <Stack.Item styles={{root : { width : '170px' }}} ><Label style={{ fontWeight: 'normal'} } required={this.state.fieldDefinition?.isRequired}>{this.props.label}</Label></Stack.Item>
        <Stack.Item grow={(this.props.showTime ? 1 : 1)} styles={{root : { alignItems: 'center'  }}}>
          <DatePicker
            disabled={this.props.disabled!}
            id={this.props.fieldDefinition.controlId}
            allowTextInput={true}
            style={{width:"100%"}}
            formatDate={this.props.dateFormat}
            value={this.state.fieldDefinition?.fieldValue}
            onSelectDate={this.onSelectedDate}
          />
        </Stack.Item>
        {this.props.showTime  && <Stack.Item grow={1}>
        <ComboBox
            disabled={this.props.disabled!}
            style={{marginLeft:'5px'}}
            allowFreeform={true}
            autoComplete="on"
            options={availableTimes}
            onChange={this.onChangeTime}
            text={this.formatDate(this.props.fieldDefinition?.fieldValue,"hh:mm")}
            buttonIconProps={{ iconName: 'Clock'}}
            
          />
        </Stack.Item>}
        
        </Stack>
    );
  }

  /**
   * Process the new value in order to keep only the Hours and Minutes
   */
  private onChangeTime = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption | undefined, index?: number | undefined, value?: string | undefined) : void => {
    let newValue : string = "";
    let currentDateValue = this.state.fieldDefinition?.fieldValue as Date;
    const fieldDefTemp = {...this.state}.fieldDefinition;

    if(fieldDefTemp != undefined){
      if(option){
        newValue = option.text;
      }
      else if(value != undefined){
        newValue = value;
      }

      // Regex to validate a format : hh:mm
      let regTime = /^\d{1,2}:\d{2}([ap]m)?$/;

      if(newValue.match(regTime)){
        console.log("time validated");
        let timeDetails = newValue.split(":");
        currentDateValue.setHours(Number(timeDetails[0]));
        currentDateValue.setMinutes(Number(timeDetails[1]));

        fieldDefTemp["fieldValue"] = currentDateValue!;
          fieldDefTemp["isDirty"] = true;
          this.setState({ fieldDefinition: fieldDefTemp });

          if(this.props.onDateChanged){
              this.props.onDateChanged(this.state.fieldDefinition);
          }
        
      } else {
        console.log("time not validated");
      }
    }
  }

    private onSelectedDate = (date: Date | null | undefined) : void => {
      let currentDateValue = this.state.fieldDefinition?.fieldValue === null ? new Date() : this.state.fieldDefinition?.fieldValue as Date;
      const fieldDefTemp = {...this.state}.fieldDefinition;
      
      if(fieldDefTemp != undefined){
        if(date === null){
          fieldDefTemp["fieldValue"] = null;
        }
        else {
          // @ts-ignore
          currentDateValue.setYear(date?.getFullYear());
          // @ts-ignore
          currentDateValue.setMonth(date?.getMonth());
          // @ts-ignore
          currentDateValue.setDate(date?.getDate());
          
          fieldDefTemp["fieldValue"] = currentDateValue;
        }
        fieldDefTemp["isDirty"] = true;
        this.setState({ fieldDefinition: fieldDefTemp });

        if(this.props.onDateChanged){
            this.props.onDateChanged(this.state.fieldDefinition);
        }
      }
    }

    private formatDate = function date2str(x: Date, y: string) {

      if(x === null){
        return undefined;
      }

      var z = {
          M: x.getMonth() + 1,
          d: x.getDate(),
          h: x.getHours(),
          m: x.getMinutes(),
          s: x.getSeconds()
      };
      y = y.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
          return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
      });
  
      return y.replace(/(y+)/g, function(v) {
          return x.getFullYear().toString().slice(-v.length)
      });
  }
  }

  


