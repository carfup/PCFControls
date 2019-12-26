import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class FileFieldTypeManager implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _container: HTMLDivElement;
	private _fileUploadDiv: HTMLDivElement;
	private _fileListTBody: HTMLDivElement;
	private _fileListTable: HTMLTableElement;
	private _inputFileElement: HTMLInputElement;
	private _fileBlockText : HTMLSpanElement;
	private _inputLabelElement: HTMLLabelElement;
	private _fileBlockIcon : HTMLImageElement;
	private _fileDeleteIcon : HTMLImageElement;
	private _notifyOutputChanged: () => void;
	private _context: ComponentFramework.Context<IInputs>;
	private _inputElementOnClick: EventListenerOrEventListenerObject;
	private _showHideRelatedFilesOnClick : EventListenerOrEventListenerObject
	private _parentRecordId : string;
	private _typeOfFile: any;
	private _fileEntityName: string;
	private _fileEntityNamePlural: string;
	private _fileFieldName: string;
	private _fileTypeFieldName: string;
	private _mappingFieldToRetrieveFiles: string | null;
	private _orderFilesBy: string;
	private _parentEntityNamePlural :string | null;
	private _mainSubEntityFieldName : string | null;
	private _areFilesStoredOnSubEntity : boolean;
	private _allowDeleteFile : boolean;
	private _clientUrl : string;
	private _showRelatedFilesText : string;
	private _hideRelatedFilesText : string;
	private _dateFormat : string;



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
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this._notifyOutputChanged = notifyOutputChanged;
		this._context = context;
		this._container = container;

		//Even handler
		this._inputElementOnClick = this.inputFileOnClick.bind(this);
		this._showHideRelatedFilesOnClick = this.showHideRelatedFilesOnClick.bind(this, null);

		//Mapping of input
		

		this._clientUrl = (<any>context).page.getClientUrl();

		// @ts-ignore
		this._parentRecordId = context.mode.contextInfo.entityId;

		// Main container
		this._container = document.createElement("div");

		// File upload container
		this._fileUploadDiv = document.createElement("div");
	
		// Load params
		this.getParams();

		// Input file field
		this._inputFileElement = document.createElement("input");
		this._inputFileElement.setAttribute("type", "file");
		this._inputFileElement.setAttribute("name", "Upload");
		this._inputFileElement.setAttribute("id", "FileFieldTypeManagerFileElement");
		this._inputFileElement.setAttribute("class", "FileFieldTypeManager-input-file");
		this._inputFileElement.addEventListener("change", this._inputElementOnClick);

		// Input file field label
		this._inputLabelElement = document.createElement("label");
		this._inputLabelElement.setAttribute("class", "FileFieldTypeManager-file-upload");
		this._inputLabelElement.setAttribute("id", "FileFieldTypeManagerLabelElement");
		this._inputLabelElement.setAttribute("style", "");

		this._fileUploadDiv.appendChild(this._inputFileElement);
		this._fileUploadDiv.appendChild(this._inputLabelElement);
		//this._fileUploadDiv.appendChild(this._inputElement);

		// File list container
		var fileBlockDiv = document.createElement("div");
		fileBlockDiv.setAttribute("class", "showRelatedFiles-flexbox");
		this._fileBlockIcon = document.createElement("img");
		this.findAndSetImage("play",".png", this._fileBlockIcon);

		// Text + icon to show / hide related files
		this._fileBlockText = document.createElement("span");
		this._fileBlockText.innerText = this._showRelatedFilesText;
		this._fileBlockText.addEventListener("click", this._showHideRelatedFilesOnClick);
		fileBlockDiv.appendChild(this._fileBlockIcon);
		fileBlockDiv.appendChild(this._fileBlockText);
		this._fileListTable = document.createElement("table");
		this._fileListTable.setAttribute("class", "FileFieldTypeManager-table");
		this._fileListTBody = document.createElement("tbody");
		this._fileListTable.appendChild(this._fileListTBody);

		// push the different element to the main container
		container.appendChild(this._fileUploadDiv);
		container.appendChild(fileBlockDiv);
		container.appendChild(this._fileListTable);

		// Set file list visible or not
		this.retrieveFileList();
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._context = context;
		this.retrieveFileList();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

	/**
	 * Retrieve all parameters of the PCF control
	 */
	public getParams():void{
		var context = this._context;
		this._fileEntityName = context.parameters.FileEntityName.raw!;
		this._fileEntityNamePlural = context.parameters.FileEntityNamePlural.raw!;
		this._typeOfFile = context.parameters.TypeOfFile.raw;
		this._fileFieldName = context.parameters.FileFieldName.raw!;
		this._fileTypeFieldName = context.parameters.FileTypeFieldName.raw!;
		this._mappingFieldToRetrieveFiles = context.parameters.MappingFieldToRetrieveFiles.raw!;
		this._orderFilesBy = context.parameters.OrderFilesBy.raw!;
		this._parentEntityNamePlural = context.parameters.ParentEntityNamePlural.raw!;
		this._mainSubEntityFieldName = context.parameters.MainSubEntityFieldName.raw!;
		this._showRelatedFilesText = context.parameters.ShowRelatedFilesText.raw!;
		this._hideRelatedFilesText = context.parameters.HideRelatedFilesText.raw!;
		this._areFilesStoredOnSubEntity = (context.parameters.AreFilesStoredOnSubEntity && context.parameters.AreFilesStoredOnSubEntity.raw && context.parameters.AreFilesStoredOnSubEntity.raw.toLowerCase() === "true") ? true : false;
		this._allowDeleteFile = (context.parameters.AllowDeleteOption && context.parameters.AllowDeleteOption.raw && context.parameters.AllowDeleteOption.raw.toLowerCase() === "true") ? true : false;
		this._dateFormat = context.parameters.DateDisplayFormat.raw!;
	}

	/**
	 * Check if value is null or empty
	 * @param value to check can ve any type
	 */
	public isNullOrUndefined(value : any) : boolean{
		return value == undefined || value == null;
	}

	/**
	 * OnClick of the text show or hide the files List 
	 */
	public showHideRelatedFilesOnClick(force: any ):void {
		var status = this._fileListTable.style.display;

		var text = "";

		this._fileBlockIcon.classList.remove("rotateimg90");

		if(status == "table"){
			text = this._showRelatedFilesText;
			this._fileBlockIcon.classList.remove("rotateimg90");
		}
		else {
			text = this._hideRelatedFilesText;
			this._fileBlockIcon.classList.add("rotateimg90");
			
		}
		status = (status == "none" || status == "") ? "table" : "none";	

		if(!this.isNullOrUndefined(force)){
			status = force;
			if(status == "table"){
				text = this._hideRelatedFilesText;
				this._fileBlockIcon.classList.add("rotateimg90");
			}
			else {
				text = this._showRelatedFilesText;
				this._fileBlockIcon.classList.remove("rotateimg90");
				
			}
		}

		this._fileListTable.style.display = status;
		this._fileBlockText.innerText = text;

	}

	/**
	 * Query all related files from the webapi
	 */
	public retrieveFileList(): void {
		var thisContext = this;
		var fieldFileName = this._fileFieldName+"_name";
		var mappingFied = this._areFilesStoredOnSubEntity ? "_"+thisContext._mappingFieldToRetrieveFiles?.toString().toLowerCase()+"_value" : thisContext._mappingFieldToRetrieveFiles?.toString().toLowerCase();

		var params = "?$filter="+mappingFied+" eq "+thisContext._parentRecordId;
		if(!thisContext.isNullOrUndefined(thisContext._fileTypeFieldName))
			params += " and "+thisContext._fileTypeFieldName+" eq "+thisContext._typeOfFile;
		if(!thisContext.isNullOrUndefined(thisContext._orderFilesBy))
			params += "&$orderby="+thisContext._orderFilesBy;
		
			
		if(thisContext._areFilesStoredOnSubEntity){

			this._context.webAPI.retrieveMultipleRecords(thisContext._fileEntityName, params).then(
				function success(relatedFiles) {
					//Clean the existing list
					thisContext._fileListTBody.innerHTML = '';

					if(relatedFiles.entities.length == 0)
						thisContext.showHideRelatedFilesOnClick("none");

					for(var i = 0; i < relatedFiles.entities.length; i++){
						var record = relatedFiles.entities[i];
						thisContext.addFileToList(record, fieldFileName);
					}

					thisContext.findAndSetImageBackGround("browse", ".png", thisContext._inputLabelElement);
				},
				function (error) {
					thisContext._context.navigation.openAlertDialog(error.message);
					console.log(error.message);
				}
			);
		}
		else {
			this._context.webAPI.retrieveRecord(thisContext._fileEntityName, this._parentRecordId).then(
				function success(relatedFile) {
					//Clean the existing list
					thisContext._fileListTBody.innerHTML = '';

					if(thisContext.isNullOrUndefined(relatedFile[thisContext._fileFieldName])) {
						thisContext.showHideRelatedFilesOnClick("none");
						return;
					}
					
					thisContext.addFileToList(relatedFile, fieldFileName);

					thisContext.findAndSetImageBackGround("browse", ".png", thisContext._inputLabelElement);
				},
				function (error){
					thisContext._context.navigation.openAlertDialog(error.message);
					console.log(error.message);
				}
			);
		}
	}

	/**
	 * Add the file record to the table which display all the files
	 * @param record containing the file details
	 * @param fieldFileName filename of the file record
	 */
	public addFileToList(record : any, fieldFileName: string):void{
		var thisContext = this;
		var trElement = document.createElement("tr");

		var recordId = record[thisContext._fileEntityName+"id"];
		
		// Link to file
		var tdElementFileName = document.createElement("td");
		var span = document.createElement("a");
		span.setAttribute("id", "filename_"+recordId);
		span.appendChild(document.createTextNode(record[fieldFileName]));
		span.setAttribute("class", "downloadFile");
		span.addEventListener("click", function(e) { thisContext.inputFileNameOnClick(e); });
		tdElementFileName.appendChild(span);
		trElement.appendChild(tdElementFileName);

		//created by
		var tdElementCreatedBy = document.createElement("td");
		var createdBy = document.createTextNode(record["_createdby_value"]);
		tdElementCreatedBy.appendChild(createdBy);
		//trElement.appendChild(tdElementCreatedBy);

		//created on 
		var tdElementCreatedOn = document.createElement("td");
		var date = new Date(record["createdon"]);
		var createdOn = document.createTextNode(date.toLocaleDateString(thisContext._dateFormat) + " "+date.toLocaleTimeString(thisContext._dateFormat));
		tdElementCreatedOn.appendChild(createdOn);
		trElement.appendChild(tdElementCreatedOn);


		//delete
		if(thisContext._allowDeleteFile) {
			var tdElementDelete = document.createElement("td");
			thisContext._fileDeleteIcon = document.createElement("img");
			thisContext._fileDeleteIcon.setAttribute("id", "delete_"+recordId);
			thisContext.findAndSetImage("delete", ".png", thisContext._fileDeleteIcon);
			thisContext._fileDeleteIcon.addEventListener("click", function(e) { thisContext.deleteFileOnClick(e); });
			tdElementDelete.appendChild(thisContext._fileDeleteIcon);
			trElement.appendChild(tdElementDelete);
		}					

		thisContext._fileListTBody.appendChild(trElement);
	}

	/**
	 * OnClick of the Input file type, patch the record with the file and manage the loading icon 
	 */
	public inputFileOnClick():void{

		var thisContext = this;
		var dataFile = "";
		var fileName = "";

		this.findAndSetImageBackGround("loading", ".gif", this._inputLabelElement);

		if(this._inputFileElement.files != undefined)
			fileName = this._inputFileElement.files[0].name;

		this._inputLabelElement.innerText = fileName;

		var fileReader = new FileReader();
		fileReader.onload = function () {
			dataFile = fileReader.result as string; 
			
			if(thisContext._areFilesStoredOnSubEntity){
				thisContext.createRecordInSubEntity(fileName, dataFile);
			}
			else {
				thisContext.patchFileToRecord(thisContext._parentRecordId, fileName, dataFile);
			}
			
		};

		if(this._inputFileElement.files != undefined)
			fileReader.readAsDataURL(this._inputFileElement.files[0]);
	}

	/**
	 * If the record needs to be created on a sub entity, create the record first
	 * @param fileName of the file to be patch
	 * @param dataFile content of the file in base64
	 */
	public createRecordInSubEntity(fileName: string, dataFile: string): void {
		var thisContext = this;
		// Creating the File record
		var mainField = thisContext._mainSubEntityFieldName;
		var mappingField = thisContext._mappingFieldToRetrieveFiles+"@odata.bind";
		var data = {};

		// @ts-ignore
		data[mainField] = thisContext._parentRecordId + "-"+ Date.now();
		if(!thisContext.isNullOrUndefined(thisContext._fileTypeFieldName)){
			// @ts-ignore
			data[thisContext._fileTypeFieldName] = thisContext._typeOfFile;
		}
		// @ts-ignore
		data[mappingField] = "/"+thisContext._parentEntityNamePlural+"("+thisContext._parentRecordId+")";
		
		thisContext._context.webAPI.createRecord(thisContext._fileEntityName, data).then(function success(createdFile) {
			 // data <-- in this var you have the file data in Base64 format
			thisContext.patchFileToRecord(createdFile.id.toString(), fileName, dataFile);
		},
		function (error) {
			thisContext._context.navigation.openAlertDialog(error.message);
			console.log(error.message);
			// handle error conditions
		});
	}

	/**
	 * Patch the record containing the file field with the file to push
	 * @param recordId record to be patched
	 * @param fileName name of the file which is pushed
	 * @param dataFile content of the file in base64
	 */
	public patchFileToRecord(recordId: string, fileName: string, dataFile: string): void{
		var thisContext = this;
		var url = thisContext._clientUrl+"/api/data/v9.1/"+thisContext._fileEntityNamePlural+"("+recordId+")/"+thisContext._fileFieldName;
		 
		var req = new XMLHttpRequest();
		req.open("PATCH", url);
		req.setRequestHeader("x-ms-file-name", fileName);
		req.setRequestHeader("Content-Type", "application/octet-stream");
		req.setRequestHeader("Content-Range", "0-4095/8192");
		req.setRequestHeader("Accept-Encoding", "gzip, deflate");
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		req.onreadystatechange = function () {
			if (this.readyState === 4) {
				req.onreadystatechange = null;
				if (this.status === 200 || this.status === 204) {
					console.log("File Upload Done.");
					thisContext.retrieveFileList();
					thisContext._inputFileElement.value = '';
				} else {
					var error = JSON.parse(this.response).error;
					console.log("Error : " + error.message);
					thisContext._context.navigation.openAlertDialog(error.message);
					thisContext._inputFileElement.value = '';
				}

				thisContext.retrieveFileList();
				thisContext._inputLabelElement.innerText = "";
				thisContext.showHideRelatedFilesOnClick("table");
			}
		};
		req.send(thisContext._base64ToArrayBuffer(dataFile));
	}

	/**
	 * Event which allow the deletion of a file
	 * @param e onClick event
	 */
	public deleteFileOnClick(e : Event):void{
		// @ts-ignore
		var recordId = e.srcElement.id.split('_')[1];
		var thisContext = this;

		this.findAndSetImage("loading", ".gif", e.srcElement);

		// Deleting the file
		var url = thisContext._clientUrl+"/api/data/v9.1/"+thisContext._fileEntityNamePlural+"("+recordId+")/"+thisContext._fileFieldName;

		// deleting the sub record
		if(thisContext._areFilesStoredOnSubEntity){
			url = thisContext._clientUrl+"/api/data/v9.1/"+thisContext._fileEntityNamePlural+"("+recordId+")";
		}
		
		var req = new XMLHttpRequest();
		req.open("DELETE", url);
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		req.onreadystatechange = function () {
			if (this.readyState === 4) {
				req.onreadystatechange = null;
				if (this.status === 200  || this.status == 204) {					
					thisContext.retrieveFileList();					
					//thisContext.findAndSetImage("delete", ".png", thisContext._fileDeleteIcon);
				} else {
					var error = JSON.parse(this.response).error;
					thisContext._context.navigation.openAlertDialog(error.message);
					console.log("Error : " + error.message);
				}
			}
		};
		req.send();

		console.log("deleting : "+recordId);
	}

	/**
	 * Event which allow the download of a file
	 * @param e onClick event
	 */
	public inputFileNameOnClick(e : Event):void{
		// @ts-ignore
		var fileName = document.getElementById(e.srcElement.id)!.innerText;
		// @ts-ignore
		var recordId = e.srcElement.id.split('_')[1];
		
		var thisContext = this;
		var url = thisContext._clientUrl+"/api/data/v9.1/"+thisContext._fileEntityNamePlural+"("+recordId+")/"+thisContext._fileFieldName+"/$value";
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.setRequestHeader("Content-Type", "application/octet-stream");
		req.setRequestHeader("Content-Range", "0-4095/8192");
		req.setRequestHeader("Accept-Encoding", "gzip, deflate");
		req.setRequestHeader("OData-MaxVersion", "4.0");
		req.setRequestHeader("OData-Version", "4.0");
		req.onreadystatechange = function () {
			if (this.readyState === 4) {
				req.onreadystatechange = null;
				if (this.status === 200) {
					var responseJson = req.responseText;
					
					var mimeType = thisContext.base64MimeType(responseJson);
					var blob = thisContext.base64toBlob(responseJson.split(",")[1], mimeType)	
					// @ts-ignore
					if (window.navigator.msSaveBlob) { // // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
						window.navigator.msSaveOrOpenBlob(blob, fileName);
					}
					else {
						var a = window.document.createElement("a");
						a.setAttribute("href", window.URL.createObjectURL(blob));
						a.setAttribute("download", fileName);
						thisContext._fileListTBody.appendChild(a);
						a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
						thisContext._fileListTBody.removeChild(a);
					}
		
				} else {
					var error = JSON.parse(this.response).error;
					console.log("Error : " + error.message);
				}
			}
		};
		req.send();
	}

	//#region base64 and Blob stuff
	/**
	 * Convert the base64 data into an array buffer
	 * @param base64 content of the file in base64
	 */
	public _base64ToArrayBuffer(base64: string): ArrayBuffer {
		var binary_string = base64;
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}

	/**
	 * Convert the content of file from base64 to Blob (used to download the file then)
	 * @param base64Data content of the file in base64
	 * @param contentType content type of the file
	 */
	public base64toBlob(base64Data : string, contentType : string): Blob {
		contentType = contentType || '';
		var sliceSize = 1024;
		var byteCharacters = atob(base64Data);
		var bytesLength = byteCharacters.length;
		var slicesCount = Math.ceil(bytesLength / sliceSize);
		var byteArrays = new Array(slicesCount);
	
		for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
			var begin = sliceIndex * sliceSize;
			var end = Math.min(begin + sliceSize, bytesLength);
	
			var bytes = new Array(end - begin);
			for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
				bytes[i] = byteCharacters[offset].charCodeAt(0);
			}
			byteArrays[sliceIndex] = new Uint8Array(bytes);
		}
		//var lol = this._base64ToArrayBuffer(base64Data);
		return new Blob(byteArrays, { type: contentType });
	}

	/**
	 * return the content type of a file from the full base64 code
	 * @param encoded base64 content file
	 */
	public  base64MimeType(encoded : string) : string {
	
		var result = "";
		var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
	  
		if (mime && mime.length) {
		  result = mime[1];
		}
	  
		return result;
	}

	/**
	 * Get an image from the resource and set it as Src attribute
	 * @param imageName image name to look for
	 * @param extension extension of the image to use
	 * @param element html element which will receive the image 
	 */
	private findAndSetImage(imageName: string, extension: string, element : any) {
		this._context.resources.getResource("img/" + imageName + extension,
			data => {
				element.setAttribute("src", this.generateImageSrcUrl(extension, data));
			},
			() => {
				console.log('Error when downloading ' + imageName + extension+' image.');
			});
	}

	/**
	 * Get an image from the resource and set it as Background-image
	 * @param imageName image name to look for
	 * @param extension extension of the image to use
	 * @param element html element which will receive the image 
	 */
	private findAndSetImageBackGround(imageName: string, extension: string, element : any) {
		this._context.resources.getResource("img/" + imageName + extension,
			data => {
				element.style.backgroundImage = "url("+this.generateImageSrcUrl(extension, data)+")";
			},
			() => {
				console.log('Error when downloading ' + imageName + extension+' image.');
			});
	}
	/**
 	* return the full base64 code of an image
	* @param filetype Name of the image extension
	* @param fileContent Base64 image content
	*/
	private generateImageSrcUrl(fileType: string, fileContent: string): string {
		return "data:image/" + fileType + ";base64," + fileContent;
	
	}
	  //#endregion
}