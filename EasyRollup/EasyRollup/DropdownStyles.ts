
import { createTheme} from "@fluentui/react/lib/Theme";
import { IDropdownStyles, IDropdownStyleProps} from "@fluentui/react/lib/Dropdown";

export const myTheme = createTheme({
    palette: {
      themePrimary: '#a9a9a9',
      themeLighterAlt: '#fcfcfc',
      themeLighter: '#f1f1f1',
      themeLight: '#e5e5e5',
      themeTertiary: '#cbcbcb',
      themeSecondary: '#b3b3b3',
      themeDarkAlt: '#979797',
      themeDark: '#808080',
      themeDarker: '#5e5e5e',
      neutralLighterAlt: '#faf9f8',
      neutralLighter: '#f3f2f1',
      neutralLight: '#edebe9',
      neutralQuaternaryAlt: '#e1dfdd',
      neutralQuaternary: '#d0d0d0',
      neutralTertiaryAlt: '#c8c6c4',
      neutralTertiary: '#595959',
      neutralSecondary: '#373737',
      neutralPrimaryAlt: '#2f2f2f',
      neutralPrimary: '#000000',
      neutralDark: '#151515',
      black: '#0b0b0b',
      white: '#ffffff',
    }});

const colorFocus = "#a9a9a9";
   
export const dropdownStyles = (props: IDropdownStyleProps):Partial<IDropdownStyles> => ({    
      title: [{
        color: "black",
        display: "block",
        fontWeight: props.isOpen===true ? "400" : "600",
        fontStretch: "normal",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: props.isOpen===true ? "black" : "transparent",         
        backgroundColor : "transparent",             
        outline: "none",     
        outlineColor: "transparent",
        outlineOffset: "0",
        boxSizing: "border-box",             
        height: "33px",
        width: "100%",                             
        selectors: {
          ':hover': {
            borderColor: "black",
            borderWidth:"1px",
            fontWeight : props.disabled === true ? "600" : "400", 
            backgroundColor : props.disabled === true ? "#E2E2E2" : "transparent",
            boxShadow: "none"
          }                
        }
      }],        
      root: {
        width: "100%"
      },
      dropdown: [{

        appearance: "none",
        outline: "none",
        border: "1px solid transparent",
        outlineColor: "transparent",
        outlineWidth: "0",
        outlineStyle : "none",
        outlineOffset: "0",
        boxShadow: "none",
        width: "100%",
        selectors:{
          ":focus:after": {
            outline: "none",
            //  border: "1px solid black",
            border: props.disabled===true ? "1px solid transparent" : `1px solid ${colorFocus}`,
            outlineColor: "transparent",
            boxShadow: "none"
          }
        }
      }],
      dropdownItem: [{
        display: "inline-flex",
        selectors: {
          ":hover": {
            color: "black"
          }
        }
      }],
      dropdownItemSelected: [{
        display: "inline-flex",
        selectors: {
          ":hover": {
            color: "black"
          }
        }
      }],
      caretDown :[{
        color: props.isOpen===true? colorFocus : "transparent"        
      }],
      caretDownWrapper: [{
        borderLeft: props.isOpen===true ? `1px solid ${colorFocus}` : "none",         
        paddingLeft: "7px"
      }]          
    });    