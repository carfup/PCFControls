import * as React from 'react';
import { Callout, Stack, TextField, DefaultButton, BaseButton, Button, IStackStyles, ITextFieldStyles, ICalloutContentStyles, DirectionalHint  } from 'office-ui-fabric-react';
import { CompositeValue } from '../EntitiesDefinition';

export interface ICompositeControlProps {
    disabled : boolean;
    visible: boolean;
    compositeValue : CompositeValue;
    doneLabel : string;
    randNumber: number;
    onClickedDone : (compositeValue? : CompositeValue) => void;
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
                                
                                return element.attributes.LogicalName != undefined && <TextField 
                                    value={element.raw!} 
                                    label={element.attributes.DisplayName}
                                    id={"acf_"+value}
                                    onChange={this.onChangeField}
                                    disabled={this.state.disabled || element.disabled!}
                                    styles={textFieldStyles}
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

