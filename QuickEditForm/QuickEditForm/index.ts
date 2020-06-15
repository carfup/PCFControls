import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Controls
import TextFieldControl from "./components/TextFieldControl";
import FilteredOptionsetControl from "./components/FilteredOptionsetControl";
import DatePickerControl from "./components/DatePickerControl";
import ButtonControl from "./components/ButtonControl";
import MessageBarControl from "./components/MessageBarControl";
import ToggleControl from "./components/ToggleControl";
import { IDropdownOption, MessageBarType } from "office-ui-fabric-react";

import { EntityReferenceInfo, DataFieldDefinition} from "./EntitiesDefinition";


export class QuickEditForm implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _context: ComponentFramework.Context<IInputs>;
	private _quickViewFormId : string;
	private _lookupMapped : string;
	private _container: HTMLDivElement;
	private _buttonsDiv: HTMLDivElement;
	private _messageDiv: HTMLDivElement;
	private _formDiv: HTMLDivElement;
	private _parentRecordDetails: EntityReferenceInfo ;
	private _recordToUpdate : EntityReferenceInfo;
	private _dataFieldDefinitions : DataFieldDefinition[];
	private _messageComponent? : any;
	private _buttonsComponnent? : any;
	private _clientUrl : string;
	private _updateError : boolean;
	private _renderingInProgress : boolean;
	private _isRecordReadOnly: boolean;
	private _lookupFieldDetails : any;
	private _useTextFieldAsLookup : boolean;
	private _forceRecordId : string;

	private notifyOutputChanged: () => void;

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
		this._context.mode.trackContainerResize(true);
		
		// Load params
		this.getParams();

		this._buttonsDiv = document.createElement("div");
		this._messageDiv = document.createElement("div");
		this._formDiv = document.createElement("div");

		container.appendChild(this._buttonsDiv);
		container.appendChild(this._messageDiv);
		container.appendChild(this._formDiv);

		this.addButtons();

		this._quickViewFormId = context.parameters.QuickViewFormId.raw!;
		this._forceRecordId = context.parameters.FieldToAttachControl.raw!;

		this._container = container;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public async updateView(context: ComponentFramework.Context<IInputs>)
	{
		// Add code to update control view
		ReactDOM.unmountComponentAtNode(this._container); 
		if(this._context.updatedProperties.includes("FieldToAttachControl")){
			//if(this._forceRecordId == context.parameters.FieldToAttachControl.raw! || !this._useTextFieldAsLookup)
			//	return;
			if(this._useTextFieldAsLookup)
				this._forceRecordId = context.parameters.FieldToAttachControl.raw!;
		}

		this.queryQuickViewFormData(this._quickViewFormId);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			FieldToAttachControl: this._forceRecordId
		};
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

	/**
	 * Adding the Refresh, Save buttons and the Loading image on top of the PCF
	 */
	private addButtons(){
		// Buttons
		let _this = this;
		this._context.resources.getResource("img/loading.gif",
			data => {
				let options = {
					onClickedRefresh : () => { this.refreshQEF() },
					onClickedSave : () => { this.saveQEF() },
					disabled : true,
					loadingImage : this.generateImageSrcUrl("gif", data),
					isLoadingVisible : "visible",
					saveLabel : this._context.resources.getString("SaveButtonLabel"),
					refreshLabel : this._context.resources.getString("RefreshButtonLabel")
				};
				_this._buttonsComponnent = ReactDOM.render(React.createElement(ButtonControl, options), this._buttonsDiv);
			},
			() => {
				console.log('Error when downloading loading.gif image.');
			});
		//console.log("addButtons : Rendering buttons ");
	}

	/**
	 * Function to refresh the content of the PCF
	 */
	private async refreshQEF(){
		this.unmountComponents();

		//disabling save button
		this._buttonsComponnent.setState({disabled : true});

		this.queryQuickViewFormData(this._quickViewFormId);
	}

	/**
	 * Saving the modifications done in the form.
	 * Save the changes from normal fields and also delete ther lookup reference if one was cleared out
	 */
	private async saveQEF(){
		let _this = this;	

		this._updateError = false;

		// Checking if we have dirty values on the form
		var dirtyValues = this._dataFieldDefinitions.filter(function(dfd) {
			if(dfd.fieldName != undefined){
				return dfd.isDirty;
			}
		});

		if(dirtyValues.length == 0){
			return;
		}

		// showing the loading img
		this.showLoading(true);

		// Processing the dirty fields to prepare the update
		let dataToUpdate : any = {};
		var lookupToClear: string[] = [];
		let entityNamePlural = "";
		dirtyValues.forEach(function(data){
			if(data.fieldValue.EntityName != undefined)
				entityNamePlural = _this.getEntityPluralName(data.fieldValue.EntityName);

			switch(data.fieldType){
				case 'customer':
					if(data.fieldValue == ""){
						lookupToClear.push(`${data.fieldName!}_${_this._recordToUpdate.EntityName}`);
					}
					else {
						dataToUpdate[`${data.fieldName!}_${data.fieldValue.EntityName}@odata.bind`] =  `/${entityNamePlural}(${data.fieldValue.Id})`;
					}
					break;
				case 'regarding':
					if(data.fieldValue == ""){
						lookupToClear.push(`${data.fieldName!}_${_this._parentRecordDetails.EntityName}_${_this._recordToUpdate.EntityName}`);
					}
					else {
						dataToUpdate[`${data.fieldName!}_${data.fieldValue.EntityName}_${_this._recordToUpdate.EntityName}@odata.bind`] =  `/${entityNamePlural}(${data.fieldValue.Id})`;
					}
					break;
				case 'owner':
				case 'lookup':
					if(data.fieldValue == ""){
						lookupToClear.push(data.fieldName!);
					}
					else {
						dataToUpdate[data.fieldName!+"@odata.bind"] =  `/${entityNamePlural}(${data.fieldValue.Id})`;
					}
					break;
				case 'date': // dateOnly
					dataToUpdate[data.fieldName!] = data.fieldValue.format("yyyy-MM-dd");
					break;
				default:
					dataToUpdate[data.fieldName!] = data.fieldValue
					break;
			}
		});

		// Update the record if we have "normal" dirty fields
		if(dataToUpdate != undefined){
			await this.updateRecord(dataToUpdate);
		}

		// removing the lookup reference if one or more was cleared out
		if(lookupToClear.length > 0){
			await this.removeLookupReference(lookupToClear);
		}

		if(!this._updateError) {
			_this.displayMessage(MessageBarType.success, _this._context.resources.getString("UpdateSuccessMessage"));
		}

		// hidding the loading image
		_this.showLoading(false);

		// disabling the save button until next change
		this._buttonsComponnent.setState({disabled : true});
	}

	/**
	 * Clear the lookup field on record
	 * @param lookupToClear field name to clear
	 */
	private async removeLookupReference(lookupToClear : string[]){
		let _this = this;
		lookupToClear.forEach(function(lookup){
			//create Xml request object 
			var xhr = new XMLHttpRequest();

			//below line is used to delete the entity record  
			let singularEntity = _this._recordToUpdate.EntityName;
			let pluralEntity = _this.getEntityPluralName(singularEntity);

			let url = `${_this._clientUrl}/api/data/v9.0/${pluralEntity}(${_this._recordToUpdate.Id})/${lookup}/$ref`;
			xhr.open("DELETE", url, false);
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
			xhr.setRequestHeader("OData-MaxVersion", "4.0");
			xhr.setRequestHeader("OData-Version", "4.0");
			xhr.onreadystatechange = function () {
				if (this.readyState == 4 /* complete */) {
					xhr.onreadystatechange = null;
					if (this.status == 204) {
						//show alert message 
					}
					else {
						var error = JSON.parse(this.response).error;
						_this.displayMessage(MessageBarType.blocked, `${_this._context.resources.getString("UpdateErrorMessage")}\n\r${error.message}`);
						_this._updateError = true;
					}
				}
			};
			xhr.send();
		});
	}

	/**
	 * Perform the update of the record with the dirty values retrieved
	 * @param dataToUpdate list of fields with the related values to update on the record
	 */
	private async updateRecord(dataToUpdate : any){
		let _this = this;
		await this._context.webAPI.updateRecord(this._recordToUpdate.EntityName, this._recordToUpdate.Id, dataToUpdate).then(
			function success(result){
				
			},
			function (error){
				// Error.code for privilege
				if(error.code != undefined && error.code == 2147746336){
					_this.displayMessage(MessageBarType.blocked, `${_this._context.resources.getString("UpdateErrorMessage")}\n\r${_this._context.resources.getString("MissingPrivilegeOnRecordMessage")}.\n\r${error.message}`);
				} else{
					_this.displayMessage(MessageBarType.blocked, `${_this._context.resources.getString("UpdateErrorMessage")}\n\r${error.message}`);
				}
				
				_this._updateError = true;
			}
		);
	}

	/**
	 * Display the message bar with the proper message and type
	 * @param type of the message (success , warning, error ..)
	 * @param message content of the displayed mesage
	 */
	private displayMessage(type : MessageBarType, message : string){
	//	this._messageDiv.innerHTML = "";

		let options = {
			messageText : message,
			messageType : type,
			showMessageBar: true
		};

		if(this._messageComponent != undefined || this._messageComponent != null){
			this._messageComponent.setState({
				messageText : message,
				messageType : type,
				showMessageBar : true
			});
		}
		else {
			this._messageComponent = ReactDOM.render(React.createElement(MessageBarControl, options), this._messageDiv);
			//console.log("displayMessage : Rendering message ");
		}
	}

	/**
	 * Get the details about the record used in the PCF such as the fields with the current values
	 */
	private async getLookupDetails(){

		this.showLoading(true);

		this._parentRecordDetails.Attributes = null;

		let _this = this;
		let lookupDetails = await this._context.webAPI.retrieveRecord(this._parentRecordDetails.EntityName, this._parentRecordDetails.Id, `?$select=${this._lookupMapped}`);
		
		//Checking if the lookup is not empty
		let lookup = lookupDetails[this._lookupMapped];
		//console.log("[getLookupDetails] retrieved lookup details ");

		this._lookupFieldDetails = lookupDetails;

		if(lookup != undefined ){
			let id = this._lookupFieldDetails[_this._lookupMapped] ?? "";
			let entity = this._lookupFieldDetails[_this._lookupMapped+"@Microsoft.Dynamics.CRM.lookuplogicalname"] ?? "";

			_this._recordToUpdate = new EntityReferenceInfo();
			_this._recordToUpdate.EntityName = entity;
			_this._recordToUpdate.Id = (_this._useTextFieldAsLookup &&  _this._forceRecordId != undefined && _this._forceRecordId != null) ?  _this._forceRecordId : id;
			_this._recordToUpdate.Name = "lookup name here";

			// Getting the fields of the record
			let attr = await _this._context.webAPI.retrieveRecord(_this._recordToUpdate.EntityName, _this._recordToUpdate.Id);
			_this.isRecordReadOnly(attr["statecode"]);
			_this._parentRecordDetails.Attributes = attr;
			//console.log("[getLookupDetails] _this._parentRecordDetails.Attributes : record values retrieved ");
		}
		else {
			this.displayMessage(MessageBarType.info, _this._context.resources.getString("LookupFieldHasNoValue").replace("{0}", this._context.parameters.LookupFieldMapped.raw!));
			this._renderingInProgress = false;
			this.showLoading(false);
		}
	}

	/**
	 * Retrieve all parameters of the PCF control
	 */
	private getParams():void{
		
		// @ts-ignore
		var contextInfo = this._context.mode.contextInfo;
		this._parentRecordDetails = new EntityReferenceInfo();
		this._parentRecordDetails.EntityName = contextInfo.entityTypeName;
		this._parentRecordDetails.Id = contextInfo.entityId;
		this._parentRecordDetails.Name = contextInfo.entityRecordName;

		this._lookupMapped = this._context.parameters.LookupFieldMapped.raw!;

		this._useTextFieldAsLookup = (this._context.parameters.UseTextFieldAsLookup && this._context.parameters.UseTextFieldAsLookup.raw && this._context.parameters.UseTextFieldAsLookup.raw.toLowerCase() === "true") ? true : false;

		this._clientUrl = (<any>this._context).page.getClientUrl();

		this._dataFieldDefinitions = [];
	}

	/**
	 * Clear the formdiv which contains all fields
	 */
	private unmountComponents (){
		this.showMessage(false);
		this._formDiv.innerHTML = "";
	}

	/**
	 * prepare the processing of the quick view form to render
	 * @param id id of the lookup field which the pcf is attached to
	 */
	private async queryQuickViewFormData(id : string){

		try
		{
			// Rendering is already in progress !
			if(this._renderingInProgress)
				return;

			this._renderingInProgress = true;

			this.unmountComponents();

			this.showLoading(true);

			let _this = this;

			// Reset the properties
			this._dataFieldDefinitions = [];

			await this.getLookupDetails();

			if(this._lookupFieldDetails != undefined && this._lookupFieldDetails[this._lookupMapped] == null){
				this._renderingInProgress = false;
				this.showLoading(false);
				return;
			}

			// Checking access to that entity
			let _hasEntityPriv = await this._context.utils.hasEntityPrivilege(this._recordToUpdate.EntityName, 2||3, 0);
			//console.log("[hasEntityPrivilege] : checking privileges ");
			if(!_hasEntityPriv){
				this.displayMessage(MessageBarType.warning, _this._context.resources.getString("MissingPrivilegeOnEntityMessage"));
				return;
			}

			// grabbing the formxml definition + attributes metadata of the quick view form to render
			this._context.webAPI.retrieveRecord("systemform", id, "?$select=formxml,objecttypecode").then(
				function success(form) {
					let allFields = _this.extractFieldsFromQVF(form.formxml);

					// Getting the metadata of the fields which are in the QuickViewForm
					_this._context.utils.getEntityMetadata(form.objecttypecode, allFields).then(em => {
						let attributes = em.Attributes.getAll();
						//console.log("[queryQuickViewFormData] attributes metadata retrieved");

						// Processing the form with the details about the related attributes
						_this.processFormXmlData(form.formxml, attributes);

						_this.showLoading(false);

						_this._renderingInProgress = false
					});
				},
				function (error){
					console.log(error.message);
					_this.displayMessage(MessageBarType.error, `${_this._context.resources.getString("QuickFormIdNotFound")}`);
					_this.showLoading(false);
				}
			);	
		}
		catch (e){
			this._renderingInProgress = false;
			this.showLoading(false);
			this.displayMessage(MessageBarType.error, `An error occured ${e.mesage}`);
		}
		
	}

	/**
	 * From the FormXML content of the QuickViewForm , extracting the fields name which will be used later on
	 * @param formXml content of the formxml from the related QuickViewForm
	 */
	private extractFieldsFromQVF(formXml : string): string[]{
		//console.log("[extractFieldsFromQVF] : getting field names ");
		let allFields = $.parseXML(formXml).getElementsByTagName("control");
		let array = [];
		this._dataFieldDefinitions = [];
		let i = 0;
		for(i; i < allFields.length; i++){
			var field = allFields[i];
			// @ts-ignore
			if(field.attributes.datafieldname != undefined){
				// @ts-ignore
				let fieldName = <string>field.attributes.datafieldname.value;
				this._dataFieldDefinitions.push({ 
					fieldName : fieldName
				});
				array.push(fieldName);
			}
		}

		return array;
	}
	

	/**
	 * Performing the first round of rendering :
	 * grabbing the title of the section if any and getting the technical name of the fields for further processing
	 * @param formxml content of the QuickViewForm
	 * @param attributesDetail Attributes metadata which are on the QuickViewForm
	 */
	private processFormXmlData(formxml : string, attributesDetail: any): void {
		//console.log("[processFormXmlData] : processing fields from formxml ");
		// Building the result details
		var sections = $.parseXML(formxml).getElementsByTagName("section");
		var i, j;
		for(i = 0; i < sections.length; i++){
			var section = sections[i].outerHTML;
			
			
			// @ts-ignore
			if($.parseXML(section).getElementsByTagName("label")[0].attributes.description == undefined){
				continue;
			}
			// @ts-ignore
			var sectionLabel =  $.parseXML(section).getElementsByTagName("label")[0].attributes.description.value;
			
			// Adding Section Name
			var sectionh1 =  document.createElement("h1");
			sectionh1.style.borderBottom = "1px solid rgb(216, 216, 216)";
			sectionh1.style.marginTop = "10px"
			sectionh1.setAttribute("class", "js");
			sectionh1.innerText = sectionLabel.toUpperCase();
			
			this._formDiv.appendChild(sectionh1);

			// a row = a field
			var rows = $.parseXML(section).getElementsByTagName("row");
			for(j = 0; j < rows.length; j++)
			{
				let row = rows[j].outerHTML;
				// @ts-ignore
				if($.parseXML(row).getElementsByTagName("control")[0].attributes.datafieldname == undefined || $.parseXML(row).getElementsByTagName("label")[0].attributes.description == undefined){
					continue;
				}

				// @ts-ignore
				var rowTechName =  $.parseXML(row).getElementsByTagName("control")[0].attributes.datafieldname.value;

				// Checking if in the attributes metadata we find the current field
				let fieldDetail = attributesDetail.filter(function(a: any){
					return a._logicalName == rowTechName}
				);
				
				if(fieldDetail.length == 1)
				{
					fieldDetail = fieldDetail[0];
				}

				// Generating the fields rendering
				this.retrieveFieldOptions(fieldDetail, rowTechName);	
			}
		}
	}

	/**
	 * Render the fields based on the metatada
	 * @param fieldDetail field metadata
	 * @param techFieldName field technical name
	 */
	private retrieveFieldOptions(fieldDetail: any, techFieldName : string){
		let _this = this;
		let item = document.createElement("div");
		var controlId = "carfup_qef_"+techFieldName;
		var type = fieldDetail.attributeDescriptor.Type;
		var label = fieldDetail.DisplayName;

		let isReadOnly = !fieldDetail.attributeDescriptor.IsValidForUpdate || this._isRecordReadOnly;

		// Grabing the proper datafieldDefinition
		let dataFieldDefinitionsDetails = this.getDataFieldDefinition(techFieldName);
		if(dataFieldDefinitionsDetails === undefined) return;

		// Calling the proper React component based on the type
		// In order to get the related values / details to render the component
		switch(type){
			case 'owner':
			case 'partylist':
			case 'customer':
			case 'lookup':
					let entityName = this._parentRecordDetails.Attributes["_" + techFieldName + "_value@Microsoft.Dynamics.CRM.lookuplogicalname"] == undefined ? fieldDetail.attributeDescriptor.EntityLogicalName : this._parentRecordDetails.Attributes["_" + techFieldName + "_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
					let options = {
						width : this._context.mode.allocatedWidth,
						label : label,
						fieldDefinition : {
							idDirty : false,
							fieldName : techFieldName,
							fieldType : (type == "lookup" && fieldDetail.attributeDescriptor.Format == 2)  ? "regarding" : type,
							controlId : controlId,
							fieldValue : {
								EntityName : entityName,
								Name : this._parentRecordDetails.Attributes[`_${techFieldName}_value@OData.Community.Display.V1.FormattedValue`] ?? "",
								Id: this._parentRecordDetails.Attributes[`_${techFieldName}_value`] ?? ""
							}
						},
						targetEntities : fieldDetail.attributeDescriptor.Targets,
						disabled : isReadOnly,
						icon : "Search",
						context : this._context,
						onClickResult : (dataFieldDefinition?: DataFieldDefinition) => {
							_this.setDataFieldDefinitionAfterChange(dataFieldDefinition, dataFieldDefinitionsDetails);							
						}
					}

					dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, options.fieldDefinition);

					ReactDOM.render(React.createElement(TextFieldControl, options), item);
				break;
			case 'datetime':
					let detailDateType = fieldDetail.attributeDescriptor.Format;

					let dpOptions = {
						width : this._context.mode.allocatedWidth,
						fieldDefinition : {
							isDirty : false,
							fieldName : techFieldName,
							fieldType : detailDateType,
							controlId : controlId,
							fieldValue : new Date(this._parentRecordDetails.Attributes[techFieldName]) ?? null
						},
						disabled : isReadOnly,
						showTime : detailDateType == "datetime",
						label : label,
						onDateChanged :  (dataFieldDefinition?: DataFieldDefinition) => {
							_this.setDataFieldDefinitionAfterChange(dataFieldDefinition, dataFieldDefinitionsDetails);
						},
						dateFormat :  (date? : Date | undefined) : string => {
							if(date == undefined) return "";

							return this._context.formatting.formatDateShort(date);
						}
					};

					dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, dpOptions.fieldDefinition);

					ReactDOM.render(React.createElement(DatePickerControl, dpOptions), item);
				break;
			case 'multiselectpicklist':
			case 'picklist': 
				const ddvalueOptions: IDropdownOption[] = fieldDetail.attributeDescriptor.OptionSet.map((o : any) => ({ key: o.Value.toString(), text : o.Label }));
				
				if(type == "picklist"){
					// @ts-ignore
					ddvalueOptions.unshift({key: null, text : _this._context.resources.getString("SelectOptionDropdown")});
				}
				let ddOptions = {
					width : this._context.mode.allocatedWidth,
					fieldDefinition : {
						isDirty : false,
						fieldName : techFieldName,
						fieldType : type,
						controlId : controlId,
						fieldValue : this._parentRecordDetails.Attributes[techFieldName] as number ?? null
					},
					disabled : isReadOnly,
					label : label,
					options: ddvalueOptions,
					isMultiSelect : type == "multiselectpicklist",
					onSelectedChanged :  (dataFieldDefinition? :DataFieldDefinition) => {
						_this.setDataFieldDefinitionAfterChange(dataFieldDefinition, dataFieldDefinitionsDetails);
					}
					
				};

				dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, ddOptions.fieldDefinition);

				ReactDOM.render(React.createElement(FilteredOptionsetControl, ddOptions), item);
				break;
			case 'money':
					let moneyOptions = {
						width : this._context.mode.allocatedWidth,
						label : label,
						fieldDefinition : {
							idDirty : false,
							fieldName : techFieldName,
							fieldType : type,
							controlId : controlId,
							fieldValue : this._parentRecordDetails.Attributes[techFieldName] ?? ""
						},
						disabled : isReadOnly,
						icon : "Money",
						onClickResult : (fieldDefinition?: DataFieldDefinition) => {
							if(dataFieldDefinitionsDetails != undefined && fieldDefinition != undefined){
								dataFieldDefinitionsDetails.isDirty = true;
								dataFieldDefinitionsDetails.fieldValue = Number(fieldDefinition.fieldValue);

								this._dataFieldDefinitions[this._dataFieldDefinitions.indexOf(dataFieldDefinitionsDetails)] = dataFieldDefinitionsDetails;

								_this._buttonsComponnent.setState({disabled : false});
							}							
						}
					};

					dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, moneyOptions.fieldDefinition);

					ReactDOM.render(React.createElement(TextFieldControl, moneyOptions), item);
				break;

			case 'boolean':
				let toggleOptions = {
					width : this._context.mode.allocatedWidth,
					label : label,
					disabled : isReadOnly,
					fieldDefinition : {
						idDirty : false,
						fieldName : techFieldName,
						fieldType : type,
						controlId : controlId,
						fieldValue : this._parentRecordDetails.Attributes[techFieldName] ?? ""
					},
					options: fieldDetail.attributeDescriptor.OptionSet,
					onChangeResult : (dataFieldDefinition?: DataFieldDefinition) => {
						_this.setDataFieldDefinitionAfterChange(dataFieldDefinition, dataFieldDefinitionsDetails);				
					}
				};

				dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, toggleOptions.fieldDefinition);

				ReactDOM.render(React.createElement(ToggleControl, toggleOptions), item);
				break;
			default :
					let icon = "";
					if(fieldDetail.attributeDescriptor.Format == "Email")
						icon = "EditMail";
					if(fieldDetail.attributeDescriptor.Format == "Url")
						icon = "Globe";

					let optionsText = {
						width : this._context.mode.allocatedWidth,
						label : label,
						fieldDefinition : {
							idDirty : false,
							fieldName : techFieldName,
							fieldType : type,
							controlId : controlId,
							fieldValue : this._parentRecordDetails.Attributes[techFieldName] ?? ""
						},
						maxLength: fieldDetail.attributeDescriptor.MaxLength,
						icon : icon,
						disabled : isReadOnly,
						onClickResult : (dataFieldDefinition?: DataFieldDefinition ) => {
							_this.setDataFieldDefinitionAfterChange(dataFieldDefinition, dataFieldDefinitionsDetails);				
						}
					}

					dataFieldDefinitionsDetails = this.completeDataDefinition(dataFieldDefinitionsDetails, optionsText.fieldDefinition);

					ReactDOM.render(React.createElement(TextFieldControl, optionsText), item);
				break;
		}

		this._formDiv.appendChild(item);
	}

	/**
	 * refactoring of the method to update the datafielddefinition after a change on a react component
	 * @param dfdChange changes to push
	 * @param dfdFrom value to update
	 */
	private setDataFieldDefinitionAfterChange(dfdChange?: DataFieldDefinition, dfdFrom? : DataFieldDefinition) {
		if(dfdFrom != undefined && dfdChange != undefined){
			this._dataFieldDefinitions[this._dataFieldDefinitions.indexOf(dfdFrom)] = dfdChange;
			this._buttonsComponnent.setState({disabled : false});
		}	
	}

	/**
	 * Complete the DataFieldDefinition which hold only the technical name by default
	 * @param dfd datafielddefinition to complete
	 * @param details details to be used to complete the exisitng DataFieldDefinition
	 */
	private completeDataDefinition(dfd : DataFieldDefinition, details : any): DataFieldDefinition{
		dfd.controlId = details.controlId;
		dfd.fieldType = details.fieldType;
		dfd.fieldValue = details.fieldValue;
		dfd.isDirty = false;
		dfd.fieldName = details.fieldName;

		return dfd;
	}

	/**
	 * Retrieve the Data Field Definition of a field
	 * @param fieldName field technical name
	 */
	private getDataFieldDefinition(fieldName : string) : DataFieldDefinition | undefined {
		let dataFieldDefinitionsDetails = this._dataFieldDefinitions.filter(function(dfd : DataFieldDefinition){
			return dfd.fieldName == fieldName
		});

		if(dataFieldDefinitionsDetails === undefined || dataFieldDefinitionsDetails.length === 0)
		return;

		return dataFieldDefinitionsDetails[0];
	}

	/**
 	* return the full base64 code of an image
	* @param filetype Name of the image extension
	* @param fileContent Base64 image content
	*/
	private generateImageSrcUrl(fileType: string, fileContent: string): string {
		return "data:image/" + fileType + ";base64," + fileContent;
	
	}

	/**
	 * Show the loading gif
	 * @param show true or false
	 */
	private showLoading(show : boolean){
		let visibility = show ? "visible" : "hidden";
		this._buttonsComponnent?.setState({isLoadingVisible : visibility});
		//console.log("isLoadingVisible : "+show);
	}

	/**
	 * Show the message bar or not
	 * @param show true or false
	 */
	private showMessage(show: boolean){
		this._messageComponent?.setState({ showMessageBar : show});
	}

	/**
	 * Based on the statecode , set the form to readonly or not
	 * @param statecode statecode of the record
	 */
	private isRecordReadOnly(statecode : number){
		this._isRecordReadOnly = statecode != 0;

		if(this._isRecordReadOnly){
			this.displayMessage(MessageBarType.warning, this._context.resources.getString("ReadOnlyRecordMessage"));
		}
	}

	private getEntityPluralName(entityName : string) : string{
		if(entityName.endsWith("s"))
			return entityName+"es";
		else if(entityName.endsWith("y"))
			return entityName.slice(0, entityName.length-1)+"ies";
		else
			return entityName+"s";
	}
}