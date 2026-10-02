import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';

import  { RollupFieldControl } from "./components/RollupFieldControl";
import { EntityReferenceDef, IRollupFieldControlProps } from "./EntitiesDefinition";

export class EasyRollupField implements ComponentFramework.ReactControl<IInputs, IOutputs> {
	private rollupField : string | undefined;
	private container: HTMLDivElement;
	private notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;
	private _recordDetails : EntityReferenceDef;
	
	constructor() {	}
	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{				
		this.rollupField = context.parameters.RollupField.raw!;

		this.container = container;
		this._context = context; 

		this.notifyOutputChanged = notifyOutputChanged;
		this._recordDetails = new EntityReferenceDef();
		this.refreshRecordDetails(context);
		const contextInfo = this.getContextInfo(context);

		// Replace the guessed plural with the real entity set name once metadata is available
		const utils = context.utils as any;
		if (utils?.getEntityMetadata) {
			utils.getEntityMetadata(contextInfo.entityTypeName, []).then((metadata: any) => {
				if (metadata?.EntitySetName && metadata.EntitySetName !== this._recordDetails.EntitySetName) {
					// entityRef is passed to the component by reference, so it picks this up on the next refresh
					this._recordDetails.EntitySetName = metadata.EntitySetName;
				}
			}, () => { /* keep the guessed name */ });
		}
	}

	private getContextInfo(context: ComponentFramework.Context<IInputs>) : any {
		const page = (context as any).page;
		// @ts-ignore
		const info = context.mode.contextInfo ?? {};
		return {
			entityTypeName : info.entityTypeName || page?.entityTypeName,
			entityId : info.entityId || page?.entityId,
			entityRecordName : info.entityRecordName
		};
	}

	// The record id can be empty at init time (form still loading, or a new unsaved record), so re-read it on every update
	private refreshRecordDetails(context: ComponentFramework.Context<IInputs>) {
		const info = this.getContextInfo(context);
		if (!info.entityTypeName)
			return;

		this._recordDetails.EntityName = info.entityTypeName;
		this._recordDetails.Id = info.entityId ? String(info.entityId).replace(/[{}]/g, "") : "";
		this._recordDetails.Name = info.entityRecordName;
		if (!this._recordDetails.EntitySetName)
			this._recordDetails.EntitySetName = this.getEntityPluralName(info.entityTypeName);
	}

	private renderControl(context: ComponentFramework.Context<IInputs>) : React.ReactElement {
		let rollupProps : IRollupFieldControlProps= {
			context : context,
			entityRef : this._recordDetails,
			rollupField : this.rollupField!,
			clientUrl : (this._context as any).page.getClientUrl(),
			label : context.mode.label || undefined,
			// A bound column carries its attributes; without one the form supplies no label, so the control draws its own
			isUnbound : !(context.parameters.FieldToAttachControl as any)?.attributes?.LogicalName,
			labelPosition : (context.parameters.LabelPosition?.raw as any) || "Left",
			labelWidthPx : context.parameters.LabelWidthPx?.raw ?? 184
		}

		return React.createElement(RollupFieldControl,  rollupProps);
	}
	

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement
	{
		this.refreshRecordDetails(context);
		return this.renderControl(context);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{		
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