import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import CompositeControl from "./components/CompositeControl";
import { CompositeValue } from "./EntitiesDefinition";
import { find } from "office-ui-fabric-react";

export class AnyCompositeFIelds implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _container: HTMLDivElement;
	private notifyOutputChanged: () => void;
	private _controlDiv : HTMLDivElement;

	// Field properties
	private _compositeValue : CompositeValue;
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._context = context; 
		this.notifyOutputChanged = notifyOutputChanged;

		// Load params
		this.getParams();

		this._controlDiv = document.createElement("div");
		this._controlDiv.style.width = "100%";
		container.appendChild(this._controlDiv);

		this._container = container;

	//	this.buildControl();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public async updateView(context: ComponentFramework.Context<IInputs>)
	{
		// Add code to update control view
		this.unmountComponents();
		this.getParams();
		this.buildControl(false);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		let valuesToReturn = {
			field1 : this._compositeValue.fieldValue1.raw,
			field2 : this._compositeValue.fieldValue2.raw,
			field3 : this._compositeValue.fieldValue3.raw,
			field4 : this._compositeValue.fieldValue4.raw,
			field5 : this._compositeValue.fieldValue5.raw,
			field6 : this._compositeValue.fieldValue6.raw,
			field7 : this._compositeValue.fieldValue7.raw,
			field8 : this._compositeValue.fieldValue8.raw
		};

		if(this._compositeValue.returnCompositeValue){
			// @ts-ignore
			valuesToReturn["FieldToAttachControl"] = this._compositeValue.fullValue;
		}

		return valuesToReturn;
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		ReactDOM.unmountComponentAtNode(this._container);
	}

	private async buildControl(getFormXml: boolean){
		var _this = this;
		if(!getFormXml){
			// @ts-ignore
			var formGuid = this._context.factory._customControlProperties.personalizationConfiguration.formGuid.guid;

			await this._context.webAPI.retrieveRecord("systemform", formGuid, "?$select=formxml,objecttypecode").then(
				function success(form) {
					_this.extractFieldsFromQVF(form.formxml);
				}
			);
		}

		let optionsText = {
			compositeValue : this._compositeValue,
			doneLabel : this._context.resources.getString("doneLabel"),
			disabled : this._context.mode.isControlDisabled,
			visible : this._context.mode.isVisible,
			onClickedDone : (compositeValue? : CompositeValue) => {
				this._compositeValue = compositeValue!;
				this.notifyOutputChanged();
			}
		}

		ReactDOM.render(React.createElement(CompositeControl, optionsText), this._controlDiv);
	}

	/**
	 * Retrieve all parameters of the PCF control
	 */
	private getParams():void{
		this._compositeValue = new CompositeValue();
		this._compositeValue.fieldValue1 = this._context.parameters.field1;
		this._compositeValue.fieldValue2 = this._context.parameters.field2;
		this._compositeValue.fieldValue3 = this._context.parameters.field3;
		this._compositeValue.fieldValue4 = this._context.parameters.field4;
		this._compositeValue.fieldValue5 = this._context.parameters.field5;
		this._compositeValue.fieldValue6 = this._context.parameters.field6;
		this._compositeValue.fieldValue7 = this._context.parameters.field7;
		this._compositeValue.fieldValue8 = this._context.parameters.field8;
		this._compositeValue.separator = this._context.parameters.separator.raw! === "%20" ? " " : this._context.parameters.separator.raw!;
		this._compositeValue.returnCompositeValue = (this._context.parameters.returnCompositeValue && this._context.parameters.returnCompositeValue.raw && this._context.parameters.returnCompositeValue.raw.toLowerCase() === "true") ? true : false;
		this.buildFullValue();
	}

	private unmountComponents (){	
		ReactDOM.unmountComponentAtNode(this._controlDiv);	
		//this._controlDiv.innerHTML = "";
	}

	private buildFullValue(): void {
		let arrayValues = [];
		
		for(let i = 1 ; i<9; i++){
			// @ts-ignore
			if(this._compositeValue["fieldValue"+i]!.raw!){
				// @ts-ignore
				arrayValues.push(this._compositeValue["fieldValue"+i].raw);
			}
		}

        this._compositeValue.fullValue = arrayValues.join(this._compositeValue.separator);	
	}

	private extractFieldsFromQVF(formXml : string): void{

		let xml = $.parseXML(formXml);
		let xmlDetails = $(xml);
		for(let i = 1 ; i<9; i++){
			// @ts-ignore
			let fieldLogicalName = this._compositeValue["fieldValue"+i]!.attributes.LogicalName;
			if(fieldLogicalName != undefined){
				// @ts-ignore
				let findings = xmlDetails.find('control[datafieldname="'+fieldLogicalName+'"]');
				for(let j = 0; j < findings.length; j++){
					// @ts-ignore
					let isFieldDisabled = findings[j].attributes.disabled.value;
					if(isFieldDisabled === "true"){
						// @ts-ignore
						this._compositeValue["fieldValue"+i].disabled = true;
						break;
					}
				}
			}
		}
	}
}