export class EntityReferenceInfo{
	public EntityName:string;
	public Id:string;
	public Name:string;
	public Attributes?: any;
}

export class EntityReferenceIdName{
	public Id:string;
	public Name:string;
}

export class DataFieldDefinition {
	public isDirty? : boolean;
	public fieldName? : string;
	public fieldType? : string;
	public fieldValue? : any;
	public controlId? : string;
}

export class KeyValuePair {
	public fieldName: string;
	public fieldValue : any;
}