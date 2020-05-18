# PCF-Controls
* [Quick Edit Form](#quick-edit-form)
* [Any Composite Fields](#any-composite-fields)
* [IBAN / SIREN / SIRET Validators](#iban--siren--siret-validators)
* [File Field Manager](#file-field-manager)

# Download

[Get the latest solution here](https://github.com/carfup/PCFControls/releases)

## Quick Edit Form
### Purpose
We all know the Quick View Form which allow you to display data related to a lookup field.
However, it's just display and you have to open the lookup record in order to edit some data.
This is where the Quick Edit Form takes place, based on a Quick View Form definition, you can display the fields within that form and interact with the data from the lookup record. 
The text definitions are managed via RESX files. 

Current supported languages : English, French, German, Spanish, Italian, Swedish, Finish, Dutch, Danish, Romanian, Ukrainian, Russian, Norwagian, Hungarian, Croatian (feel free to send a PR for new languages or wording issues !)

![](https://stuffandtacos.azurewebsites.net/content/images/2020/04/2020_04_09_17-31-41.gif)

More Details : [https://stuffandtacos.azurewebsites.net/2020/04/15/pcf-quick-edit-form/](https://stuffandtacos.azurewebsites.net/2020/04/15/pcf-quick-edit-form/)

### Configuration
There are 4 parameters to customize the PCF.

|Parameter|Description|Required|
|:---------|:-----------|:----:|
|FieldToAttachControl|Field to attach the control|x|
|QuickVIewFormId|Guid of the Quick View Form you want to use to display the fields|x|
|LookupFieldMapped|This is the technical name of the lookup field used as reference - ex : *_primarycontactid_value* (for a contact from an account)|x|
|UseTextFieldAsLookup|Give the ability to the control to dynamically load data based on the GUID put in the mapped field, skipping the value from the lookup except if the field value is empty|x|

## Any Composite Fields
### Purpose
Now that the UCI is the common interface for all environment we had to deal with the disapearing of the Composite fields rendering.
Today, if you try to add the "FullName" field on your form, the UCI will render the firstname and lastname separated.
The idea here was to allow you to "re"build all composite fields you want.
You can attached up to 8 fields (the order of mapped fields is used for the rendering), choose a separator and tada.

![](https://carfupstorage.blob.core.windows.net/sharex/AnyCompositeFields.gif)

### Capabilities
If the field holder is locked, then all fields mapped with the control will be rendered as "Read Only" mode.
You can also lock field by field, the control will retrieve the field definition from the form and render the specific field as "Read only" mode while the others will be editable.

### Configuration
There are 11 parameters to customize the PCF (with 5 mandatory).

|Parameter|Description|Required|
|:---------|:-----------|:----:|
|FieldToAttachControl|Field to attach the control|x|
|separator|Separator character, space or words between all values (for a space, put %20 in the configuration field)|x|
|returnCompositeValue|Choose if you want to return the value of the composite control to your field holder. (default: true)|x|
|Field 1|Field 1 to be used in the popup of the Composite rendering (text)|x|
|Field 2|Field 2 to be used in the popup of the Composite rendering (text) |x|
|Field ..|Field .. to be used in the popup of the Composite rendering (text) ||
|Field 8|Field 8 to be used in the popup of the Composite rendering (text) ||

## IBAN / SIREN / SIRET Validators
### Purpose
In many projects, we need to implement custom logic to validate Account data such as the IBAN, the Siret and the Siren. In few clicks, you can now get the information directly on the form to know if the data is correct and get that information to a custom field.

![](https://carfupstorage.blob.core.windows.net/sharex/2019-06-20_22-41-20.gif)

### Configuration
There are 6 parameters for those controls :

* Source field : field on which the control will be based
* The Two options field to get the output (if the code is valid or not)
* Display a notification error is the value is incorrect (optional)
* Customize the error message is displayed (optional)
* The possibility to set your own Valid icon (url) (optional)
* The possibility to set your own Invalid icon (url) (optional)

## File Field Manager
### Purpose
Microsoft is currently deploying a new type of field on your favorite CDS environments : the Files !
Currently, you have the possibility to create the fields and use them on Flow or Canvas App, there is no current possibility to use them on a model driven app form.
That's where this control comes into the light !

There are 2 possibilities to use the control : 

* with fields on the same entity (you can upload one file per field) - *Left side on the demo*
* with fields which are on a sub entity (you can upload as many files as you want !) - *Right side on the demo*

![](https://carfupstorage.blob.core.windows.net/sharex/2019-12-26_15-12-25.gif)

More Details : [https://stuffandtacos.azurewebsites.net/2019/12/27/file-field-manager-for-model-driven-app/](https://stuffandtacos.azurewebsites.net/2019/12/27/file-field-manager-for-model-driven-app/)

### Configuration
There are a lot of parameters to handle as many cases as I could : 

|Parameter|Description|Required|
|:---------|:-----------|:----:|
|FieldToAttachControl|Field to attach the control|x|
|FileEntityName|Entity name which contains the file field (singular) - ex : *opportunity*|x|
|FileEntityNamePlural|Entity name which contains the file field (plural) - ex : *opportunities*|x|
|FileFieldName|Name of the file field from the above entity|x|
|OrderFilesBy|Allow you to order the files (if many) - ex : *createdon desc*|x|
|ShowRelatedFilesText|Custom the text which is displayed to show the files||
|HideRelatedFilesText|Custom the text which is displayed to hide the files||
|DateDisplayFormat|Define the rendering of the dates based on the location - ex : *en-US* or *fr-Fr*||
|TypeOfFile|Using sub entity to store file, you can flag them using an option set||
|FileTypeFieldName|Based on above description, field on file Entity which will be used to flag||
|AllowDeleteOption|Display the icon to allow the deletion of the file(s) (security roles are not taken into account)|x|
|AreFilesStoredOnSubEntity|Are files stored on a sub entity ?|x|
|MappingFieldToRetrieveFiles|Field from sub entity which is used as lookup to parent entity||
|MainSubEntityFieldName|Primary field of the sub entity which will be filled by the parent record id and date to create the sub record which will host the file||
|ParentEntityNamePlural|Parent entity name (plural) if files are stored on sub entity.||




