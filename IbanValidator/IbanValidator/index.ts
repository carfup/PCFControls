import {IInputs, IOutputs} from "./generated/ManifestTypes";
import { getUnpackedSettings } from "http2";

export class IbanValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	// Value of the field is stored and used inside the control 
	private _ibanValue: string;
	private _isValidIban: boolean;
	private _iconValid: string;
	private _iconInvalid : string;
	private _displayNotificationError : boolean;
	private _displayNotificationErrorMessage : string;
	private _displayNotificationErrorUniqueId : string;
	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 

	// parameter declarations
	private _ibanValueElement: HTMLInputElement;
	private _ibanValueValidationElement: HTMLElement;
	// Reference to the control container HTMLDivElement
	// This element contains all elements of our custom control example
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _ibanValueChanged: EventListenerOrEventListenerObject;
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
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		// assigning environment variables. 
        this._context = context; 
		this._notifyOutputChanged = notifyOutputChanged; 
		
		// Add control initialization code
		this._ibanValueChanged = this.ibanValueChanged.bind(this);

		//Get params
		this.getParams();
		
		// textbox control
		this._ibanValueElement=document.createElement("input");
		this._ibanValueElement.setAttribute("type", "text");
		this._ibanValueElement.setAttribute("class", "pcfinputcontrol");
		this._ibanValueElement.addEventListener("change", this._ibanValueChanged);
		this._ibanValueElement.value = this._ibanValue;
		// @ts-ignore
		this._ibanValueElement.setAttribute("maxlength", context.parameters.IbanValue.attributes?.MaxLength)
		if(context.mode.isControlDisabled){
			this._ibanValueElement.setAttribute("disabled", "disabled");
		}
		
		
		// img control
		this._ibanValueValidationElement = document.createElement("img");
		this._ibanValueValidationElement.setAttribute("class", "pcfimagecontrol");
		this._ibanValueValidationElement.setAttribute("hidden", "hidden");
		this._ibanValueValidationElement.setAttribute("height", "24px");
		
		container.appendChild(this._ibanValueElement);
		container.appendChild(this._ibanValueValidationElement);	

		if(!context.mode.isVisible){
			container.setAttribute("visibility", "hidden");
		}

		this.ibanValueChanged(null);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		
		this._ibanValueElement.value = this._ibanValue;
		
		if(context.mode.isControlDisabled){
			this._ibanValueElement.setAttribute("disabled", "disabled");
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			IbanValue: this._ibanValue,
			IsValidIban : this._isValidIban
		};	 
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._ibanValueElement.removeEventListener("change", this._ibanValueChanged);
	}

	/**
	 * Retrieve all parameters of the PCF control
	 */
	public getParams():void{
		var context = this._context;
		this._ibanValue = context.parameters.IbanValue.raw!;
		this._displayNotificationError = (context.parameters.DisplayNotificationError && context.parameters.DisplayNotificationError.raw && context.parameters.DisplayNotificationError.raw.toLowerCase() === "true") ? true : false;
		this._displayNotificationErrorMessage = context.parameters.DisplayNotificationErrorMessage.raw!;
		this._displayNotificationErrorUniqueId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		this._iconValid = this._context.parameters.IconValid == undefined ? "" : String(this._context.parameters.IconValid.raw);
		this._iconInvalid = this._context.parameters.IconInvalid == undefined ? "" : String(this._context.parameters.IconInvalid.raw);
	}

	/**
 	* Called when a change is detected in the phone number input
	* @param filetype Name of the image extension
	* @param fileContent Base64 image content
	*/
	private generateImageSrcUrl(fileType: string, fileContent: string): string {
		return "data:image/" + fileType + ";base64," + fileContent;
	}

	/**
	 * Called when a change is detected in the phone number input
	 * @param imageName Name of the image to retrieve
	 */
	private findAndSetImage(imageName: string) {
		if(imageName.startsWith("http") || imageName.startsWith("https")){
			this._ibanValueValidationElement.setAttribute("src", imageName);
		} 
		else {
			this._context.resources.getResource("img/" + imageName + ".png",
				data => {
					this._ibanValueValidationElement.setAttribute("src", this.generateImageSrcUrl(".png", data));
				},
				() => {
					console.log('Error when downloading ' + imageName + '.png image.');
				});
		}
	}

	private ibanValueChanged(evt: Event | null):void
	{
		this._ibanValue = this._ibanValueElement.value;
		this._isValidIban = this.isValidIBANNumber(this._ibanValue);
		
		
		this._ibanValueValidationElement.removeAttribute("hidden");

		if(this._ibanValue != ""){
			if(this._displayNotificationError){
				if(this._isValidIban){
					// @ts-ignore
					this._context.utils.clearNotification(this._displayNotificationErrorUniqueId);
				} else {
					// @ts-ignore
					this._context.utils.setNotification(this._displayNotificationErrorMessage,this._displayNotificationErrorUniqueId);
				}
			}
			
			var iconToDisplay = this._iconValid == "null" || this._iconValid == "" || this._iconValid == undefined ? "IconValid" : this._iconValid;
			if(!this._isValidIban){
				iconToDisplay = this._iconValid == "null" ||  this._iconInvalid == "" || this._iconValid == undefined ? "IconInvalid" : this._iconInvalid;
			} 

			this.findAndSetImage(iconToDisplay);
		}
		else {
			// @ts-ignore
			this._context.utils.clearNotification(this._displayNotificationErrorUniqueId);
			this._ibanValueValidationElement.setAttribute("hidden", "hidden");
		}

		this._notifyOutputChanged(); 
	}

	public isValidIBANNumber(input: string):boolean {
		let CODE_LENGTHS: any = {
			AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
			BY: 28, CH: 21, CR: 21, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, ES: 24,
			FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28, HR: 21,
			HU: 28, IE: 22, IL: 23, IS: 26, IT: 27, IQ: 23, JO: 30, KW: 30, KZ: 20, LB: 28,
			LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19, MR: 27,
			MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29, RO: 24,
			RS: 22, SA: 24, SC: 31, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23, 
			TN: 24, TR: 26, UA: 29, VA: 22, VG: 24, XK: 20
		};

		var code:RegExpMatchArray |null, digits:any;
		var iban = input.toUpperCase().replace(/[^A-Z0-9]/g, ''), // keep only alphanumeric characters
		code = iban.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/), // match and capture (1) the country code, (2) the check digits, and (3) the rest
		digits;
		// check syntax and length
		if (!code || iban.length !== CODE_LENGTHS[code[1]]) {
			return false;
		}
		// rearrange country code and check digits, and convert chars to ints
		var letter = (code[3] + code[1] + code[2]);
		digits = this.letterCode(letter);


		// final check
		return this.mod97(digits);
	}

	public letterCode(letter: string):string{
		var result = "";
		var l = letter.split("");
		l.forEach(element => {
			var charCode = element.charCodeAt(0);
			//If number we keep it
			if ((charCode > 47) && (charCode < 58)) {
				result = result + element;
			}
			// if letter we convert it to number
			else if (charCode > 64 && charCode < 91) {
				result = result + (element.charCodeAt(0) - 65 + 10).toString();
			}
		});
		
		return result;
	}
	
	public mod97(s: string):boolean {

		var modulo = 0;
		for (var index = 0; index < s.length; index += 5) {
			var subpart = parseInt(modulo + "" + s.substr(index, 5));
			modulo = subpart % 97;
		}

		return modulo == 1;
	}
}