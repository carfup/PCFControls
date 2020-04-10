# PCF-Controls
* [Quick Edit Form](#quick-edit-form)
* [IBAN / SIREN / SIRET Validators](#iban--siren--siret-validators)
* [File Field Manager](#file-field-manager)

## Quick Edit Form
### Purpose
We all know the Quick View Form which allow you to display data related to a lookup field.
However, it's just display and you have to open the lookup record in order to edit some data.
This is where the Quick Edit Form takes place, based on a Quick View Form definition, you can display the fields within that form and interact with the data from the lookup record. 
The text definitions are managed via RESX files. Currently supporting French & English (do not hesite to PR a new language !)

![](https://stuffandtacos.azurewebsites.net/content/images/2020/04/2020_04_09_17-31-41.gif)

### Configuration
There are 4 parameters to customize the PCF.

|Parameter|Description|Required|
|:---------|:-----------|:----:|
|FieldToAttachControl|Field to attach the control|x|
|QuickVIewFormId|Guid of the Quick View Form you want to use to display the fields|x|
|LookupFieldMapped|This is the technical name of the lookup field used as reference - ex : *_primarycontactid_value* (for a contact from an account)|x|
|UseTextFieldAsLookup|Give the ability to the control to dynamically load data based on the GUID put in the mapped field, skipping the value from the lookup except if the field value is empty|x|

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

#### Demo :
![](https://carfupstorage.blob.core.windows.net/sharex/2019-12-26_15-12-25.gif)

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




