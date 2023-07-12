import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class SiretValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	// Value of the field is stored and used inside the control 
	private _value: string;
	private _isValid: boolean;
	private _iconValid: string;
	private _iconInvalid : string;
	private _displayNotificationError : boolean;
	private _displayNotificationErrorMessage : string;
	private _displayNotificationErrorUniqueId : string;
	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 

	// parameter declarations
	private _valueElement: HTMLInputElement;
	private _valueValidationElement: HTMLElement;
	// Reference to the control container HTMLDivElement
	// This element contains all elements of our custom control example
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _valueChanged: EventListenerOrEventListenerObject;
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
		this._context = context; 
		this._notifyOutputChanged = notifyOutputChanged; 
		
		//Get params
		this.getParams();

		// Add control initialization code
		this._valueChanged = this.valueChanged.bind(this);
		
		// textbox control
		this._valueElement = document.createElement("input");
		this._valueElement.setAttribute("type", "text");
		this._valueElement.setAttribute("class", "pcfinputcontrol");
		this._valueElement.addEventListener("change", this._valueChanged);
		this._valueElement.value = this._value;
		// @ts-ignore
		this._valueElement.setAttribute("maxlength", context.parameters.SiretValue.attributes?.MaxLength)

		
		// img control
		this._valueValidationElement = document.createElement("img");
		this._valueValidationElement.setAttribute("class", "pcfimagecontrol");
		this._valueValidationElement.setAttribute("hidden", "hidden");
		this._valueValidationElement.setAttribute("height", "24px");

		if(context.mode.isControlDisabled){
			this._valueElement.setAttribute("disabled", "disabled");
		}
		
		container.appendChild(this._valueElement);
		container.appendChild(this._valueValidationElement);

		if(!context.mode.isVisible){
			container.setAttribute("visibility", "hidden");
		}

		this.valueChanged(null);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		if(context.mode.isControlDisabled){
			this._valueElement.setAttribute("disabled", "disabled");
		} else {
			this._valueElement.removeAttribute("disabled");
		}

		this.valueChanged(null, true);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			SiretValue: this._value,
			IsValid : this._isValid
		};	 
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._valueElement.removeEventListener("change", this._valueChanged);
	}

	/**
	 * Retrieve all parameters of the PCF control
	 */
	public getParams():void{
		var context = this._context;
		this._value = context.parameters.SiretValue.raw!;
		this._displayNotificationError = (context.parameters.DisplayNotificationError && context.parameters.DisplayNotificationError.raw && context.parameters.DisplayNotificationError.raw.toLowerCase() === "true") ? true : false;
		this._displayNotificationErrorMessage = context.parameters.DisplayNotificationErrorMessage.raw!;
		this._displayNotificationErrorUniqueId =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		this._iconValid = this._context.parameters.IconValid.raw!;
		this._iconInvalid = this._context.parameters.IconInvalid.raw!;
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
			this._valueValidationElement.setAttribute("src", imageName);
		} 
		else {
			this._context.resources.getResource("img/" + imageName + ".png",
				data => {
					this._valueValidationElement.setAttribute("src", this.generateImageSrcUrl(".png", data));
				},
				() => {
					console.log('Error when downloading ' + imageName + ' image.');
				});
		}
	}

	private valueChanged(evt: Event | null, updatedFromContext : boolean = false):void
	{	
		//Coucou
		this._value = updatedFromContext ? this._context.parameters.SiretValue.raw! : this._valueElement.value;
		this._valueElement.value = this._value.toUpperCase().replace(/[^0-9]/g, '');		

		if ( (this._value.length != 14) || (isNaN(parseInt(this._value))) ){
			this._isValid = false;
		}
		else {
			// Donc le SIRET est un numérique à 14 chiffres
			// Les 9 premiers chiffres sont ceux du SIREN (ou RCS), les 4 suivants
			// correspondent au numéro d'établissement
			// et enfin le dernier chiffre est une clef de LUHN. 
			var sum = 0;
			var tmp: number;
			for (var cpt = 0; cpt < this._value.length; cpt++) {
				if ((cpt % 2) == 0) { // Les positions impaires : 1er, 3è, 5è, etc... 
					tmp = parseInt(this._value.charAt(cpt)) * 2; // On le multiplie par 2

					if (tmp > 9) {
						tmp -= 9;	// Si le résultat est supérieur à 9, on lui soustrait 9
					}
				}
				else {
					tmp = parseInt(this._value.charAt(cpt));
				}
				sum += tmp;
			}

			this._isValid = (sum % 10) == 0; // Si la somme est un multiple de 10 alors le SIRET est valide 
		}

		if(this._value != "" && this._valueElement.value != ""){
			this._value = this._valueElement.value;
			this._valueValidationElement.removeAttribute("hidden");

			if(this._displayNotificationError){
				if(this._isValid){
					// @ts-ignore
					this._context.utils.clearNotification(this._displayNotificationErrorUniqueId);
				} else {
					// @ts-ignore
					this._context.utils.setNotification(this._displayNotificationErrorMessage,this._displayNotificationErrorUniqueId);
				}
			}

			var iconToDisplay = this._iconValid ?? "IconValid";
			if(!this._isValid){
				iconToDisplay = this._iconInvalid ?? "IconInvalid";
			} 
			
			this.findAndSetImage(iconToDisplay);
		}	
		else {
			// @ts-ignore
			this._context.utils.clearNotification(this._displayNotificationErrorUniqueId);
			this._valueValidationElement.setAttribute("hidden", "hidden");
		}

		this._notifyOutputChanged(); 
	}
}