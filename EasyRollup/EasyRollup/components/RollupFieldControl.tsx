import * as React from 'react';

import { IRollupFieldControlProps } from '../EntitiesDefinition';
import {  Field, FluentProvider, Input, Tooltip, webLightTheme } from '@fluentui/react-components';
import { Calculator24Regular } from '@fluentui/react-icons';

export interface IRollupFieldControlState {
  value?: number | null | undefined;
  date? : Date;
  updated?: string | null | undefined;
  result : "success" | "none" | "error" | "warning" | undefined;
}

export class RollupFieldControl extends React.Component<IRollupFieldControlProps, IRollupFieldControlState> {
  constructor(props :IRollupFieldControlProps){
    super(props);
    this.getData();
  }

  private refreshData = () => {

    this.setState({
      updated : "Value is being refreshed.. Please wait."
    });

    let _this = this;

    let url = `${_this.props.clientUrl}/api/data/v9.0/CalculateRollupField(Target=@target,FieldName=@fieldname)?@target={'@odata.id':'${this.props.entityRef.EntitySetName}(${this.props.entityRef.Id})'}&@fieldname='${this.props.rollupField}'`;
    var xhr = new XMLHttpRequest();

    xhr.open("GET", url, false);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("OData-MaxVersion", "4.0");
    xhr.setRequestHeader("OData-Version", "4.0");
    xhr.onreadystatechange = function () {
      if (this.readyState == 4 /* complete */) {
        xhr.onreadystatechange = null;
        if (this.status == 204 || this.status == 200) {
          _this.getData();

          _this.setState({
            updated : `${_this.props.rollupField}` + " was successfully updated.",
            result : "success"
          });

          setTimeout(() => {
            _this.setState({
              updated : null,
              result : "none"
            });
          }, 3000);

        }
        else {
          var error = JSON.parse(this.response).error;

          _this.setState({
            updated : error,
            result : "error"
          });
        }
      }
    };
    xhr.send();    
  }

  private getData = () => {
    let _this = this;

    _this.props.context.webAPI.retrieveRecord(_this.props.entityRef.EntityName, _this.props.entityRef.Id, `?$select=${_this.props.rollupField},${_this.props.rollupField}_date`).then(
      function success(result){
        _this.setState({
          value : result[`${_this.props.rollupField}`],
          date : result[`${_this.props.rollupField}_date@OData.Community.Display.V1.FormattedValue`].toString()
        });
      },
      function (error){ 
        _this.setState({
          updated : "Error while getting data : " + error.message,
          result : "error"
        });
      }
    );
       
  }

  public render(): React.ReactNode {
    let id = Math.floor((Math.random() * 100) + 1).toString();
  
    return (
      <div style={{ width: "100%" }}>
        <FluentProvider theme={webLightTheme}>
          <Tooltip 
            content={`Last refreshed on ${this.state?.date!}`}
            // This id is used on the tooltip itself, not the host
            // (so an element with this id only exists when the tooltip is shown)
            relationship="label"
          >
            <Field
              validationState={this.state?.result! ?? "none"}
              validationMessage={this.state?.updated!}
            >
              <Input
                readOnly
                value={this.state?.value! == null ? "" : this.props.context.formatting.formatInteger(this.state?.value!)}
                type="text"
                aria-describedby={id}
                style={{backgroundColor: "#F5F5F5", border: "none"}}
                contentAfter={<Calculator24Regular  onClick={
                  () => {
                  this.refreshData();
                }}  />}
              />
            
            </Field>
          </Tooltip>
          
        </FluentProvider> 
      </div>
    )
  }
}




