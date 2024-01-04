import { IInputs } from "./generated/ManifestTypes";

export class EntityReferenceDef{
	public Id:string;
	public Name:string;
	public EntityName: string;
	public EntitySetName: string | null;
}

export interface IRollupFieldControlProps {
	context : ComponentFramework.Context<IInputs>,
	entityRef : EntityReferenceDef,
	rollupField : string,
	clientUrl : string
  }