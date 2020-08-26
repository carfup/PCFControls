import * as React from 'react';
import { DefaultButton, BaseButton, Button  } from '@fluentui/react/lib/Button';
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { Stack, IStackStyles } from '@fluentui/react/lib/Stack';
import { Callout, ICalloutContentStyles, DirectionalHint } from '@fluentui/react/lib/Callout';
import { CompositeValue } from '../EntitiesDefinition';
import { IInputs } from '../generated/ManifestTypes';

export interface ICompositeControlProps {
    disabled : boolean;
    visible: boolean;
    compositeValue : CompositeValue;
    doneLabel : string;
    randNumber: number;
    onClickedDone : (compositeValue? : CompositeValue) => void;
    context?: ComponentFramework.Context<IInputs>;
}

export interface IBCompositeControlState {
    showCallout: boolean,
    compositeValue : CompositeValue;
    disabled : boolean;
    visible : boolean;
}

const stackStyles: Partial<IStackStyles> = { root: { width: "100%" } };
const textFieldStyles: Partial<ITextFieldStyles> = { root: { width: "100%" } };
const calloutStyles: Partial<ICalloutContentStyles> = { root: { width: "300px" } };

export default class CompositeControl extends React.Component<ICompositeControlProps, IBCompositeControlState> {
    constructor(props: ICompositeControlProps) {
        super(props);
        this.state = {
            showCallout : false,
            compositeValue : this.props.compositeValue,
            disabled : this.props.disabled,
            visible : this.props.visible
        };
    }

    

    render(){
        const elements = ['fieldValue1', 'fieldValue2', 'fieldValue3', 'fieldValue4', 'fieldValue5', 'fieldValue6', 'fieldValue7', 'fieldValue8'];

        return (
            <Stack horizontal id="acf_compositestack" styles={stackStyles}>
                <TextField 
                    value={this.state.compositeValue.fullValue} 
                    readOnly={true}
                    onClick={() => this.setState({ showCallout : true }) }
                    styles={textFieldStyles}
                    id={"acf_compositeFullValue"+this.props.randNumber}
                />
                {this.state.showCallout && (
                    <Callout
                        target={"#acf_compositeFullValue"+this.props.randNumber}
                        onDismiss={() => this.setState({ showCallout : false }) }
                        styles={calloutStyles}
                        directionalHint={DirectionalHint.topCenter}
                    >
                        <Stack style={{margin : "10px"}}>
                            {elements.map((value, index) => {
                                // @ts-ignore
                                let element = this.state.compositeValue[value];
                                const isMultiline = element.type === "SingleLine.TextArea" || element.type === "Multiple";
                                
                                return element.attributes.LogicalName != undefined && <TextField 
                                    value={element.raw!} 
                                    label={element.attributes.DisplayName}
                                    id={"acf_"+value}
                                    onChange={this.onChangeField}
                                    onClick={this.onClickPhone}
                                    disabled={this.state.disabled || element.disabled!}
                                    styles={textFieldStyles}
                                    multiline={isMultiline}
                                    autoAdjustHeight={isMultiline}
                                    required={element.attributes.RequiredLevel == 1 || element.attributes.RequiredLevel == 2}
                                    maxLength={element.attributes.MaxLength}
                                />
                            })}

                            <DefaultButton text={this.props.doneLabel} onClick={this.onClick} style={{marginTop:'10px',alignSelf: "flex-end"}}/>
                        </Stack>
                        
                    </Callout>
                )}
            </Stack>
        );
    }

    private onChangeField = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) : void => {
        // @ts-ignore
        let target = event.target.id.replace('acf_', '');
        const compositeValue = {...this.state}.compositeValue;
        // @ts-ignore
        compositeValue[target].raw = newValue!;
        this.setState({compositeValue : compositeValue});
    }

    private onClick = (event: React.MouseEvent<HTMLDivElement | HTMLAnchorElement | HTMLButtonElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) : void =>  {
        const compositeValue = {...this.state}.compositeValue;
        this.buildFullValue(compositeValue);
        this.setState({showCallout : false});
        this.props.onClickedDone(this.state.compositeValue);
    }

    private onClickPhone = (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement, MouseEvent>) : void => {
        // @ts-ignore
        let target = event.target.id.replace('acf_', '');
        const compositeValue = {...this.state}.compositeValue;
        // @ts-ignore
        let isPhoneType = compositeValue[target].type === "SingleLine.Phone";

        if(!isPhoneType) return;

        // @ts-ignore
        const currentValue : any = compositeValue[target].raw!;
        this.props.context?.navigation.openUrl(`tel:${currentValue}`);
    }

    private buildFullValue = (compositeValue : CompositeValue) : void => {
        let arrayValues = [];
		
		let i = 1;
		for(i ; i<9; i++){
			// @ts-ignore
			if(compositeValue["fieldValue"+i]!.raw!){
				// @ts-ignore
				arrayValues.push(compositeValue["fieldValue"+i].raw);
			}
		}

        compositeValue.fullValue = arrayValues.join(compositeValue.separator);	
                  
        this.setState({compositeValue : compositeValue});
    }
};

