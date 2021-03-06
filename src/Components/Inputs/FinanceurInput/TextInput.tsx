import * as React from "react"
import { style } from "typestyle"

import { isNullOrUndef, stringIsNullOrEmpty, getFontClassName, numberIsNullOrUndef, arrayIsNullOrEmpty } from "../../../Common/utils/helpers";
import { IconInfos, IconSuccess, IconError, IconChevron, DirectionEnum } from "../../Display/Icons/Icons";

import { ValidationReturn, GetFinanceurColors, ColorSet } from ".";


export enum PosIconEnum {
    Gauche = 0,
    Droite = 1,
}

export enum InputTypeEnum {
    Text = 0,
    Password = 1,
    ComboBox = 2,
    Number = 3,
}

export interface TextInputProps {
    Value?: string;
    Placeholder?: string;
    Disable?: boolean;
    Label?: string;
    Icon?: JSX.Element;
    IconPos?: PosIconEnum;
    InformationText?: string;
    SuccessText?: string;
    ErrorText?: string;
    Width?: string;
    Require?: boolean;
    ReadOnly?: boolean;
    InitialState?: boolean;
    Type?: InputTypeEnum;
    ComboItems?: string[];
    ComboItemSelectIdx?: number;
    NumberMax?: number;
    NumberMin?: number;
    AutoFocus?: boolean;
    Validate?: (value: string) => ValidationReturn;
    onChange?: (value: string) => void;
    onFocus?: (event) => void;
    onBlur?: (event) => void;
    onKeyDown?: (event, isAbort?: boolean) => void;
    onComboItemSelect?: (idx: number) => void;
}

export interface TextInputState {
    Success?: boolean;
    Value: string;
    TextCanChange: boolean;
    IconAGauche: boolean;
    ComboOuverte: boolean;
    SpecificMessage: string;
}

export default class TextInput extends React.Component<TextInputProps, TextInputState> {
    private control: any;

    constructor(p, c) {
        super(p, c);   

        var ValueIdxInvalide: boolean = numberIsNullOrUndef(this.props.ComboItemSelectIdx) || this.props.ComboItemSelectIdx < 0
            || isNullOrUndef(this.props.ComboItems) || this.props.ComboItemSelectIdx >= this.props.ComboItems.length;

        var valeur: string = this.props.Type === InputTypeEnum.ComboBox && ValueIdxInvalide === false ? 
            this.props.ComboItems[this.props.ComboItemSelectIdx] : 
            this.props.Value;
        if (this.props.Type === InputTypeEnum.Number) {
            if (stringIsNullOrEmpty(valeur) || numberIsNullOrUndef(Number(valeur))) {
                valeur = "";
            } else if (isNullOrUndef(this.props.NumberMax) === false && this.props.NumberMax < Number(valeur)) {
                valeur = this.props.NumberMax.toString();
            } else if (isNullOrUndef(this.props.NumberMin) === false && this.props.NumberMin > Number(valeur)) {
                valeur = this.props.NumberMin.toString();
            }
        }

        this.state = {
            Success: isNullOrUndef(this.props.InitialState) ? null : this.props.InitialState,
            Value: valeur,
            TextCanChange: this.props.Type !== InputTypeEnum.ComboBox && this.props.ReadOnly !== true,
            IconAGauche: this.props.Type === InputTypeEnum.ComboBox || this.props.Type === InputTypeEnum.Number ? true : 
                isNullOrUndef(this.props.IconPos) || this.props.IconPos === PosIconEnum.Gauche,
            ComboOuverte: false,
            SpecificMessage: null,
        };
    }

    private processValidation = (value: string) => {
        var validation: ValidationReturn = isNullOrUndef(this.props.Validate) ? null : this.props.Validate(value);

        if (isNullOrUndef(this.props.Validate)) {
            this.setState({ Value: value, Success: this.props.InitialState, SpecificMessage: null, });
        } else if (isNullOrUndef(validation) || isNullOrUndef(validation.ok)) {
            this.setState({ Value: value, Success: null, SpecificMessage: null, });
        } else {
            this.setState({ Value: value, Success: validation.ok, SpecificMessage: validation.specificMessage, });
        }
    }
    private doNumberDown = () => {
        if (this.props.ReadOnly || this.props.Disable) {
            return ;
        }
        
        var saveOldValue: string = this.state.Value;
        var valeur: number = stringIsNullOrEmpty(this.state.Value) ? -1 : (Number(this.state.Value) - 1);
        if (isNullOrUndef(this.props.NumberMax) === false && this.props.NumberMax < Number(valeur)) {
            valeur = this.props.NumberMax;
        } else if (isNullOrUndef(this.props.NumberMin) === false && this.props.NumberMin > Number(valeur)) {
            valeur = this.props.NumberMin;
        }
        this.processValidation(valeur.toString());
        if ((! isNullOrUndef(this.props.onChange)) && saveOldValue !== valeur.toString()) {
            this.props.onChange(valeur.toString());
        }
    }
    private doNumberUp = () => {
        if (this.props.ReadOnly || this.props.Disable) {
            return ;
        }

        var saveOldValue: string = this.state.Value;
        var valeur: number = stringIsNullOrEmpty(this.state.Value) ? 1 : (Number(this.state.Value) + 1);
        if (isNullOrUndef(this.props.NumberMax) === false && this.props.NumberMax < Number(valeur)) {
            valeur = this.props.NumberMax;
        } else if (isNullOrUndef(this.props.NumberMin) === false && this.props.NumberMin > Number(valeur)) {
            valeur = this.props.NumberMin;
        }
        this.processValidation(valeur.toString());
        if ((! isNullOrUndef(this.props.onChange)) && saveOldValue !== valeur.toString()) {
            this.props.onChange(valeur.toString());
        }
    }

    private onBlur = (event) => {
        this.processValidation(event.target.value);

        if ( ! isNullOrUndef(this.props.onBlur)) {
            this.props.onBlur(event);
        }
    }
    private onChange = (event) => {
        if (this.props.Type === InputTypeEnum.Number) {
            if (numberIsNullOrUndef(Number(event.target.value)) 
                    || Number(event.target.value) < this.props.NumberMin || Number(event.target.value) > this.props.NumberMax) {
                event.preventDefault();
                return false;
            }
        }

        var saveOldValue: string = this.state.Value;
        this.processValidation(event.target.value);

        if ((! isNullOrUndef(this.props.onChange)) && saveOldValue !== event.target.value) {
            this.props.onChange(event.target.value);
        }
    }
    private onKeyDown = (event) => {
        var abort: boolean = false;
        
        if (!this.props.Disable && !this.props.ReadOnly) {
            if (this.props.Type === InputTypeEnum.ComboBox && !arrayIsNullOrEmpty(this.props.ComboItems)) {
                if (event.keyCode === 38) { // fleche haut
                    var current: number = this.props.ComboItems.indexOf(this.state.Value);
                    if (current > 0) {
                        this.onComboItemClick(current - 1);
                        abort = true;
                    }
                } else if (event.keyCode === 40) { // fleche bas
                    var current: number = this.props.ComboItems.indexOf(this.state.Value);
                    if (current < this.props.ComboItems.length - 1) {
                        this.onComboItemClick(current + 1);
                        abort = true;
                    }
                }
            } else if (this.props.Type === InputTypeEnum.Number) {
                if (event.keyCode === 38) { // fleche haut
                    this.doNumberUp();
                    abort = true;
                } else if (event.keyCode === 40) { // fleche bas
                    this.doNumberDown();
                    abort = true;
                }
            }
        }
        if (abort) {
            event.preventDefault();
            return ;
        }

        if (!this.state.TextCanChange) {
            if (event.keyCode === 9 || (event.keyCode >= 112 && event.keyCode <= 123)) {
                // tabulation ou F1-F12 => on laisse passer
            } else {
                event.preventDefault();
                abort = true;
            }
        }

        if ( ! isNullOrUndef(this.props.onKeyDown)) {
            this.props.onKeyDown(event, abort);
        }
    }

    private onChevronClick = (event) => {
        if (this.props.Type === InputTypeEnum.ComboBox) {
            this.setState({ ComboOuverte: true, });
        } else { // type=number
            this.doNumberDown();
        }
    }
    private onChevron2Click = (event) => {
        this.doNumberUp();
    }
    private onChevronBlur = (event) => {
        if (this.props.Type === InputTypeEnum.ComboBox) {
            this.setState({ ComboOuverte: false, });
        }
    }
    private onComboItemClick = (idx: number) => {
        var saveOldValue: string = this.state.Value;
        this.processValidation(this.props.ComboItems[idx]);

        if ( ! isNullOrUndef(this.props.onComboItemSelect)) {
            this.props.onComboItemSelect(idx);
        }
        if ((! isNullOrUndef(this.props.onChange)) && saveOldValue !== this.props.ComboItems[idx]) {
            this.props.onChange(this.props.ComboItems[idx]);
        }
    }

    public focus = () => {
        if (!this.props.Disable) {
            this.control.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        var partialState: any = {};

        if (nextProps.Value !== this.props.Value && nextProps.Value !== this.state.Value) {
            switch (nextProps.type) {
                case InputTypeEnum.ComboBox:
                    break;
                case InputTypeEnum.Number:
                    var valeur: string = nextProps.Value;
                    if (stringIsNullOrEmpty(valeur) || numberIsNullOrUndef(Number(valeur))) {
                        valeur = "";
                    } else if (isNullOrUndef(this.props.NumberMax) === false && this.props.NumberMax < Number(valeur)) {
                        valeur = this.props.NumberMax.toString();
                    } else if (isNullOrUndef(this.props.NumberMin) === false && this.props.NumberMin > Number(valeur)) {
                        valeur = this.props.NumberMin.toString();
                    }
                    partialState = { Value: valeur, Success: nextProps.InitialState, SpecificMessage: null, };
                    break;
                default:
                    partialState = { Value: nextProps.Value, Success: nextProps.InitialState, SpecificMessage: null, };
                    break;
            }
        }
        if (nextProps.InitialState !== this.state.Success) {
            partialState.Success = nextProps.InitialState;
        }

        if (partialState.hasOwnProperty("Success")) {
            this.setState(partialState);
        }
    }

    render() {
        var chevronPresent: boolean = this.props.Type === InputTypeEnum.ComboBox || this.props.Type === InputTypeEnum.Number;
        var chevron2Present: boolean = this.props.Type === InputTypeEnum.Number;
        var droiteChevron: number = this.props.Type === InputTypeEnum.ComboBox ? 8 : 2;

        var couleurs: ColorSet = GetFinanceurColors(this.props.Disable, this.state.Success);

        var styleG = style({
            width: isNullOrUndef(this.props.Width) ? "250px" : this.props.Width,
            position: "relative",
            display: "inline-block",
            verticalAlign: "top",
            textAlign: "left",
        });
        var styleLabel = getFontClassName({ color: couleurs.Label, fontSize: "14px", });
        var styleRequire = getFontClassName({ color: "red", fontSize: "14px", lineHeight: 1.36, }) + " " + style({
            position: "absolute",
            top: 0,
            right: 0,
        });
        var styleFontInput = getFontClassName({ color: couleurs.Value, fontSize: "14px", lineHeight: 1.36, });
        var styleInputContainer = style({
            position: "relative",
            width: "100%",
            display: "inline-block",
            $nest: {                
                "& *:focus": {
                    outline: "none",
                },
            },
        });
        var styleInput = style({
            width: "100%",
            border: "none",
            borderBottom: "1px solid " + couleurs.Border,
            paddingBottom: "6px",
            boxSizing: "border-box",
            paddingLeft: (this.state.IconAGauche && isNullOrUndef(this.props.Icon) === false ? 20 : 0).toString() + "px",
            paddingRight: ((this.state.IconAGauche && (chevronPresent === false) ? 8 : 28) + (this.props.Require ? 6 : 0)).toString() + "px",
            backgroundColor: "inherit",
            $nest: {
                "&:hover": {
                    borderBottomColor: couleurs.BorderFocus,
                },
                "&:focus": {
                    borderBottomColor: couleurs.BorderFocus,
                },
                "&::placeholder": {
                    color: couleurs.Placeholder,
                    opacity: 0.5,
                }
            },
        });
        var styleIcon = style({
            position: "absolute",
            top: 0,
            left: this.state.IconAGauche ? "0px" : "",
            right: this.state.IconAGauche ? "" : (this.props.Require ? "14px" : "8px"),
        });
        var styleChevron = style({
            position: "absolute",
            top: this.props.Type === InputTypeEnum.Number ? "40%" : "20%",
            right: (droiteChevron + (this.props.Require ? 6 : 0)).toString() + "px",
        });
        var styleChevron2 = style({
            position: "absolute",
            top: "0",
            right: (droiteChevron + (this.props.Require ? 6 : 0)).toString() + "px",
        });
        var styleIconInfos = style({
            opacity: this.state.Success === false ? 1 : 0.5,
        });
        var styleFontInfos = getFontClassName({ color: couleurs.Value, fontSize: "12px", lineHeight: 1.58, }) + " " + style({
            opacity: this.state.Success === false ? 1 : 0.5,
        });
        var styleFontInfosSuc = getFontClassName({ color: couleurs.Border, fontSize: "12px", lineHeight: 1.58, });
        var styleSousLabel = style({
            textAlign: "justify",
            display: "inline-block",
            width: "100%",
        });
        var styleCombo = style({
            position: "absolute",
            top: "100%",
            right: 0,
            left: 0,
            maxHeight: "250px",
            overflow: "auto",
            padding: "10px 10px 0px",
            zIndex: 9998,
            backgroundColor: "#ffffff",
            borderRadius: "0 0 4px 4px",
            border: "1px solid " + couleurs.BorderDefault,
            borderTop: "none",
        });
        var styleLigneCombo = getFontClassName({ color: couleurs.ValueDefault, fontSize: "14px", lineHeight: 1.36, }) + " " + style({
            minHeight: "19px",
            cursor: "pointer",
        });

        var type = this.props.Type === InputTypeEnum.Password ? "password" : "";
        
        var texteSup: JSX.Element = null;
        if (this.state.Success) {
            var texteSupStr: string = stringIsNullOrEmpty(this.state.SpecificMessage) ? 
                stringIsNullOrEmpty(this.props.SuccessText) ? "" : this.props.SuccessText : 
                this.state.SpecificMessage;
            if (texteSupStr != "") {
                texteSup = <IconSuccess Color={couleurs.Border} BackgroundColor="" IconSize="16px" >
                    <span className={styleFontInfosSuc} > {texteSupStr}</span>
                </IconSuccess>;
            }
        } else if (this.state.Success !== null) {
            var texteSupStr: string = stringIsNullOrEmpty(this.state.SpecificMessage) ? 
                stringIsNullOrEmpty(this.props.ErrorText) ? "" : this.props.ErrorText : 
                this.state.SpecificMessage;
            if (texteSupStr != "") {
                texteSup = <IconError Color={couleurs.Border} BackgroundColor="" IconSize="16px" >
                    <span className={styleFontInfosSuc} > {texteSupStr}</span>
                </IconError>;
            }
        }
        if (texteSup === null && ! stringIsNullOrEmpty(this.props.InformationText)) {
            texteSup = <IconInfos Color={couleurs.Value} BackgroundColor="" IconSize="16px" className={styleIconInfos} >
                <span className={styleFontInfos} > {this.props.InformationText}</span>
            </IconInfos>;
        } 

        return <span className={styleG} >
            { stringIsNullOrEmpty(this.props.Label) ? null :
                <span className={styleLabel} >
                    {this.props.Label}
                    <br />
                </span>
            }
            
            <span className={styleFontInput + " " + styleInputContainer} >
                { this.props.Require ? <span className={styleRequire} >*</span> : null }

                { isNullOrUndef(this.props.Icon) ? null : 
                    <span className={styleIcon} >{this.props.Icon}</span>
                }
                { chevronPresent === false ? null :
                    <IconChevron Direction={DirectionEnum.Bas} Color={couleurs.Chevron} IconSize="14px" BackgroundColor=""
                            onClick={this.props.Disable ? null : this.onChevronClick} onBlur={this.onChevronBlur} 
                            tabIndex={-1} className={styleChevron} />
                }
                { chevron2Present === false ? null : 
                    <IconChevron Direction={DirectionEnum.Haut} Color={couleurs.Chevron} IconSize="14px" BackgroundColor=""
                            onClick={this.props.Disable ? null : this.onChevron2Click} className={styleChevron2} />
                }

                <input className={styleFontInput + " " + styleInput} disabled={this.props.Disable} type={type} autoFocus={this.props.AutoFocus}
                    value={isNullOrUndef(this.state.Value) ? "" : this.state.Value} placeholder={this.props.Placeholder}
                    onFocus={this.props.onFocus} onKeyDown={this.onKeyDown} onBlur={this.onBlur} onChange={this.onChange}
                    ref={(c) => { this.control = c; }} />

                { this.state.ComboOuverte === false ? null :
                    <span className={styleCombo} >                    
                        { isNullOrUndef(this.props.ComboItems) ? null :
                            this.props.ComboItems.map((value: string, idx: number): JSX.Element => {
                                return <p key={idx} onMouseDown={() => this.onComboItemClick(idx)} className={styleLigneCombo} tabIndex={-1} >
                                    {stringIsNullOrEmpty(value) ? "..." : value}
                                </p>
                            }) 
                        }
                    </span>
                }
            </span>

            <span className={styleSousLabel} >{texteSup}</span>
        </span>;
    }
}