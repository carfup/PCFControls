import { DataFieldDefinition } from "./EntitiesDefinition";

export class SharedLogicClass {

    private _userSettings : ComponentFramework.UserSettings;

    constructor(userSettings : ComponentFramework.UserSettings){
        this._userSettings = userSettings;
    }

    /**
	 * convert the date into local user timezone
	 * @param value date to convert
	 */
	public convertDate(value: Date, convertTo: "utc" | "local") {
		var offsetMinutes = this._userSettings.getTimeZoneOffsetMinutes(value);
		var browserOffset = new Date().getTimezoneOffset();
		var convert = convertTo;
		// The offset returned is the Timezone offset minutes from UTC to Local
		// E.g. Central Time (UTC-6) - getTimeZoneOffsetMinutes will return -360 minutes
		// To get to a utc time we must add 360 (offset)
		// To get to local we must add -360 (offset)
		//offsetMinutes = offsetMinutes  * (convertTo == "local" ? 1 : -1);
		
		var localDate = this.addMinutes(value, offsetMinutes);

		if(convertTo == "utc"){
			let offsetMinutesMinusBrowser = -offsetMinutes - browserOffset;
			localDate = this.addMinutes(value, offsetMinutesMinusBrowser);
			return localDate;
		}
			
		return this.getUtcDate(localDate);
	  }
	  private addMinutes(date: Date, minutes: number): Date {
		return new Date(date.getTime() + minutes * 60000);
	  }
	  private getUtcDate(localDate: Date) {
		return new Date(
		  localDate.getUTCFullYear(),
		  localDate.getUTCMonth(),
		  localDate.getUTCDate(),
		  localDate.getUTCHours(),
		  localDate.getUTCMinutes(),
		);
	}

    /**
	 * Show the loading gif
	 * @param show true or false
	 */
	public showLoading(show : boolean, buttonComponent : any){
		let visibility = show ? "visible" : "hidden";
		buttonComponent?.setState({isLoadingVisible : visibility});
	}


    /**
	 * Complete the DataFieldDefinition which hold only the technical name by default
	 * @param dfd datafielddefinition to complete
	 * @param details details to be used to complete the exisitng DataFieldDefinition
	 */
	public completeDataDefinition(dfd : DataFieldDefinition, details : any): DataFieldDefinition{
		dfd.controlId = details.controlId;
		dfd.fieldType = details.fieldType;
		dfd.fieldValue = details.fieldValue;
		dfd.isDirty = false;
		dfd.fieldName = details.fieldName;
		dfd.isRequired = details.isRequired;
		dfd.fieldSchemaName = details.schemaName;

		return dfd;
	}

    /**
	 * Retrieve the Data Field Definition of a field
	 * @param fieldName field technical name
	 */
	public getDataFieldDefinition(fieldName : string, dataFieldDefintions: DataFieldDefinition[]) : DataFieldDefinition | undefined {
		let dataFieldDefinitionsDetails = dataFieldDefintions.filter(function(dfd : DataFieldDefinition){
			return dfd.fieldName == fieldName
		});

		if(dataFieldDefinitionsDetails === undefined || dataFieldDefinitionsDetails.length === 0)
		return;

		return dataFieldDefinitionsDetails[0];
	}

    /**
	 * Return entityname in plural version
	 * @param entityName entity to retrieve in plural version
	 */
	public getEntityPluralName(entityName : string) : string{
		if(entityName.endsWith("s"))
			return entityName+"es";
		else if(entityName.endsWith("y"))
			return entityName.slice(0, entityName.length-1)+"ies";
		else
			return entityName+"s";
	}

    /**
 	* return the full base64 code of an image
	* @param filetype Name of the image extension
	* @param fileContent Base64 image content
	*/
	public generateImageSrcUrl(fileType: string, fileContent: string): string {
		return "data:image/" + fileType + ";base64," + fileContent;
	}
}