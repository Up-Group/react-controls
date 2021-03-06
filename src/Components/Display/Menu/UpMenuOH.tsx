﻿import * as React from "react"
import { style } from "typestyle"
import { Scrollbars } from 'react-custom-scrollbars';

import { getFontClassName, stringIsNullOrEmpty, isNullOrUndef, addZeroBeforeNumber, arrayIsNullOrEmpty, formatDateTime } from "../../../Common/utils/helpers";
import UpHover from '../../Containers/Hover/UpHover';
import { IconChevron, IconUtilisateur, IconDeconnexion, DirectionEnum, IconVerrou, IconAlertes } from "../Icons/Icons";


const UP = require("./up.png");
const heightTopBar: number = 60;
const widthLeftMenuStandard: number = 300;
const widthLeftMenuCollapse: number = 64;


class branchIdHelper {
    static toArray(id: string) {
        return id.split(/(\d{1,})/).filter(x => { return x !== "" });
    }

    static getLevel(id: string) {
        return this.toArray(id).length / 2;
    }

    static hasChild(id: string) {
        return id.substr(id.length - 1, 1) === "*";
    }
}

export interface Utilisateur {
    Nom: string;
    Links: (string | JSX.Element)[];
}


var styleMenuOh = style({
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    height: "100%",//window.innerHeight,
    width: "100%",//window.innerWidth,
});
var styleLeftMenu = style({
    zIndex: 1,
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: widthLeftMenuStandard,
    backgroundColor: "#4e5b59",
    alignItems: "center",
    transition: "width 0.5s",
    overflow: "hidden",
    $nest: {
        '& i': {
            cursor: "pointer",
        },
        '& a': {
            textDecoration: "none",
        },
    },
});
var imgHomelink = style({ display: "inline" });

var styleLeftMenuCollapse = style({
    width: widthLeftMenuCollapse,
    $nest: {
        '& a': {
            display: "none",
        },
        ['& .' + imgHomelink]: {
            display: "inline"
        }
    },
});
var rightSpace = style({
    position: "absolute",
    top: 0,
    right: 0,
    left: widthLeftMenuStandard,
    height: "100%",
    transition: "left 0.5s",
    overflow: "hidden",
});
var rightSpaceCollapse = style({
    left: widthLeftMenuCollapse,
});
var styleTopbar = style({
    width: "100%",
    left: 0,
    top: 0,
    position: "absolute",
    height: heightTopBar,
    backgroundColor: "#ffffff",
    textAlign: "right",
});
var styleContenu = style({
    position: "absolute",
    left: 0,
    top: heightTopBar,
    bottom: 0,
    right: 0,
    overflow: "hidden",
});
var styleUserExpand = style({
    position: "absolute",
    top: heightTopBar,
    right: "128px",
    overflow: "visible",
});


export interface MenuItemData {
    icon?: string;
    title: JSX.Element | string;
    uri: string;
    isVisible: boolean;
    childMenuItems?: MenuItemData[];
    styleType?: "button";
    forceOpen?: boolean;
}


export interface UpMenuProps {
    menuItems: MenuItemData[];
    onMenuClick?: (uri: string) => boolean | void;
    onHomeClick?: () => void
    Recherche: JSX.Element;
    Antennes: JSX.Element;
    Utilisateur: Utilisateur;
    onDeconnexionClick: () => void;
    selectMenu?: (menu: MenuItemData) => boolean;
}

export interface UpMenuState {
    selectedBranchId?: string;
    collapseActive: boolean;
    collapse: boolean;
    hoverMenu: boolean;
}

export default class UpMenuOH extends React.Component<UpMenuProps, UpMenuState> {
    constructor(p, c) {
        super(p, c);
        this.state = {
            selectedBranchId: "",
            collapse: false,
            hoverMenu: false,
            collapseActive: false,
        };
    }

    render() {
        var right = rightSpace + (this.state.collapseActive ? " " + rightSpaceCollapse : "")

        return <div className={styleMenuOh/*()*/} >
            <LeftMenu
                onHover={this.onHover}
                onCollapseChange={this.onCollapseChange} collapse={this.state.collapse} selectedBranchId={this.state.selectedBranchId} onBranchClick={this.onBranchClick}
                onHomeClick={this.props.onHomeClick} menuItems={this.props.menuItems} onMenuClick={this.props.onMenuClick} />

            <div className={right}>
                <TopMenu Recherche={this.props.Recherche} Antennes={this.props.Antennes}
                    Utilisateur={this.props.Utilisateur} onDeconnexionClick={this.props.onDeconnexionClick} />

                <div className={styleContenu/*()*/} >
                    {this.props.children}
                </div>
            </div>
        </div>;
    }

    onCollapseChange = () => {
        if (this.state.collapseActive) {
            // widthLeftMenu = widthLeftMenuStandard;
            this.setState({ collapseActive: false, collapse: false });
        } else {
            // widthLeftMenu = widthLeftMenuCollapse;
            this.setState({ collapseActive: true, collapse: true });
        }
    }

    onHover = (hover: boolean) => {
        if (this.state.collapseActive) {
            // widthLeftMenu = hover ? widthLeftMenuStandard : widthLeftMenuCollapse;
            this.setState({ collapse: !hover });
        }
    }

    componentDidUpdate() {
        if (this.props.selectMenu != null) {
            var idSelected = this.findSelected(this.props.menuItems);
            if (this.state.selectedBranchId !== idSelected && idSelected != null) {
                this.setState({ selectedBranchId: idSelected });
            }
        }
    }

    private findSelected(MenuItemData: MenuItemData[]): string {
        for (var i = 0; i < MenuItemData.length; i++) {
            var localId = i + (MenuItemData[i].childMenuItems != null && MenuItemData[i].childMenuItems.length != 0 ? "*" : "-");
            if (this.props.selectMenu(MenuItemData[i]) == true) {
                return localId;
            } else {
                if (MenuItemData[i].childMenuItems != null && MenuItemData[i].childMenuItems.length != 0) {
                    var child = this.findSelected(MenuItemData[i].childMenuItems);
                    if (child != null) {
                        return localId + child.toString();
                    }
                }
            }
        }
        return null;
    }

    private onBranchClick = (branchId: string) => {
        this.setState({ selectedBranchId: branchId, });
    }
}


export interface LeftMenuProps {
    onBranchClick: (branchId: string) => void;
    menuItems: MenuItemData[];
    onHomeClick?: () => void;
    onMenuClick?: (uri: string) => boolean | void;
    selectedBranchId?: string;
    onCollapseChange: () => void;
    onHover: (hover: boolean) => void;
    collapse: boolean;
}

export interface LeftMenuState {
}

export class LeftMenu extends React.Component<LeftMenuProps, LeftMenuState> {
    constructor(p, c) {
        super(p, c);
        this.state = {
            selectedBranchId: "",
        };
    }

    render() {
        var img_space = style({
            //width: "100%",
            height: 60,
            margin: 24,
        });
        var img_style = style({
            //width: "100%",
            maxHeight: "100%",
            maxWidth: "100%"
            //width: this.props.collapse ? 30 : 60
        });
        var div_style = style({
            height: 45,
            paddingLeft: 25,
            color: "#FFF",
            fontSize: 25,
        });
        var firstSub = style({
            // marginLeft: 24,
            paddingLeft: "24px",
            position: "absolute",
            top: "153px",
            bottom: "0",
            left: "0",
            right: "0",
            $nest: {
                "& > *": {
                    height: "100%",
                    width: "100%",
                },
            },
        });

        var left = styleLeftMenu + (this.props.collapse ? " " + styleLeftMenuCollapse : "");
        // <input type="button" value="TTT" onClick={this.props.onCollapseChange} />
        return <aside className={left} >
            <div className={img_space}>
                <a className={imgHomelink} onClick={this.props.onHomeClick} >
                    <img className={img_style} src={UP} ></img>
                </a>
            </div>
            <div className={div_style} >
                <span className={"icon-Lmenu"} onClick={this.props.onCollapseChange} />
            </div>
            <div className={firstSub} >
                <UpHover onHoverChange={this.props.onHover}>
                    <SubMenu
                        open={false}
                        onBranchClick={this.props.onBranchClick}
                        branchId={""}
                        selectedBranchId={this.props.selectedBranchId}
                        onMenuClick={this.props.onMenuClick}
                        childMenuItems={this.props.menuItems}
                        top={false}
                        collapse={this.props.collapse}
                    />
                </UpHover>
            </div>
        </aside>
    }
}


export interface TopMenuProps {
    Recherche: JSX.Element;
    Antennes: JSX.Element;
    Utilisateur: Utilisateur;
    onDeconnexionClick: () => void;
}

export interface TopMenuState {
}

export class TopMenu extends React.Component<TopMenuProps, TopMenuState> {
    constructor(p, c) {
        super(p, c);
        this.state = {
        };
    }

    render() {
        var styleGauche = style({
            width: "20%",
            minWidth: "250px",
            float: "left",
            marginLeft: "60px",
            marginTop: "16px",
        });
        var styleDroite = getFontClassName({ fontSize: "14px", color: "#4a4a4a", }) + " " + style({
            marginTop: "16px",
            height: "100%",
            marginRight: "60px",
            display: "inline-block",
        });

        return <div className={styleTopbar} >
            {isNullOrUndef(this.props.Recherche) ? null :
                <div className={styleGauche} >
                    {this.props.Recherche}
                </div>
            }

            <span className={styleDroite} >
                {isNullOrUndef(this.props.Antennes) ? null :
                    this.props.Antennes
                }

                {isNullOrUndef(this.props.Utilisateur) ? null :
                    <UserExpand Utilisateur={this.props.Utilisateur} />
                }

                <IconDeconnexion onClick={this.props.onDeconnexionClick} />
            </span>
        </div>
    }
}


export interface UserExpandProps {
    Utilisateur: Utilisateur;
}

export interface UserExpandState {
    UserExpand: boolean;
}

export class UserExpand extends React.Component<UserExpandProps, UserExpandState> {
    constructor(p, c) {
        super(p, c);
        this.state = {
            UserExpand: false,
        };
    }

    onUserClick = () => {
        this.setState({ UserExpand: true, });
    }
    onUserBlur = () => {
        this.setState({ UserExpand: false, });
    }

    render() {
        var styleInfosTexte = style({
            marginRight: "48px",
            $nest: {
                "& > i": {
                    fontStyle: "normal",
                    margin: "0 8px",
                },
                "& *:focus": {
                    outline: "none",
                },
            },
        });
        var styleComboUser = style({
            padding: "16px 16px 6px",
            zIndex: 9998,
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
            border: "1px solid #eaeae9",
            textAlign: "left",
        });

        return <IconUtilisateur IconSize="14px" lineHeight={1.14} AvecCercle={false} Color="#4a4a4a" BackgroundColor="#ffffff" >
            <span className={styleInfosTexte} >
                <i>{this.props.Utilisateur.Nom}</i>
                { arrayIsNullOrEmpty(this.props.Utilisateur.Links) ? null :
                    <span>
                        <IconChevron Direction={DirectionEnum.Bas} Color="#4a4a4a" BackgroundColor="#ffffff" IconSize="14px"
                            onClick={this.onUserClick} tabIndex={-1} onBlur={this.onUserBlur} />

                        { !this.state.UserExpand ? null : 
                            <div className={styleUserExpand + " " + styleComboUser} >
                                { this.props.Utilisateur.Links.map((link: string | JSX.Element, idx: number): JSX.Element => {
                                    return <p key={idx} >{link}</p>;
                                }) }
                            </div>
                        }
                    </span>
                }
            </span>
        </IconUtilisateur>;
    }
}


export interface SubMenuProps {
    childMenuItems?: MenuItemData[];
    onMenuClick: (uri: string) => void;
    open: boolean;
    onBranchClick: (branchId: string) => void;
    branchId: string;
    selectedBranchId: string;
    top: boolean;
    collapse: boolean;
}

export interface SubMenuState {
}

export class SubMenu extends React.Component<SubMenuProps, SubMenuState> {
    constructor(p, c) {
        super(p, c);
        this.state = {};
    }

    startsWith(str: string, search: string) {
        return str.substr(0, search.length) === search;
    }

    render() {
        if (this.props.childMenuItems == null || this.props.childMenuItems.length == 0) {
            return null;
        }

        var lis = this.props.childMenuItems.map((v, i, arr) => {
            var localId = this.props.branchId + i + (v.childMenuItems != null && v.childMenuItems.length != 0 ? "*" : "-");

            return <SubItems
                forceOpen={v.forceOpen}
                sibling={arr}
                top={this.props.top}
                icon={v.icon}
                selectedBranchId={this.props.selectedBranchId}
                branchId={localId}
                onBranchClick={this.props.onBranchClick}
                key={`${v.title}${v.uri}${i}`}
                open={this.props.open}
                onMenuClick={this.props.onMenuClick}
                uri={v.uri}
                title={v.title}
                isVisible={v.isVisible}
                childMenuItems={v.childMenuItems}
                collapse={this.props.collapse}
                styleType={v.styleType}
            />
        });

        if (this.props.branchId === "") {
            return <Scrollbars style={{
                height: "100%",//window.innerHeight - 150 
            }} >
                {lis}
            </Scrollbars>;
        } else {
            return <div>
                {lis}
            </div>;
        }
    }

    private getMenuItemfromId(branchid: string, menu: MenuItemData[]) {
        var first = branchid.substr(0, 2);
        var rest = branchid.substr(2, branchid.length);

        var find = menu.filter((x) => { return x.isVisible === true })[first.substr(0, 1)].childMenuItems;

        if (find.length == 0) {
            return menu;
        }

        if (rest == "") {
            return find
        }
        return this.getMenuItemfromId(rest, find);
    }

    get levelselectedBranchId() {
        return branchIdHelper.getLevel(this.props.selectedBranchId);
    }

    get selectedBranchIdHasChild() {
        return branchIdHelper.hasChild(this.props.selectedBranchId);
    }
}


export interface SubItemsProps extends MenuItemData {
    onMenuClick: (uri: string) => boolean | void;
    open: boolean;
    onBranchClick: (branchId: string) => void;
    branchId: string;
    selectedBranchId: string;
    top: boolean;
    sibling: MenuItemData[];
    collapse: boolean;
}

export interface SubItemsState {
}

export class SubItems extends React.Component<SubItemsProps, SubItemsState> {
    constructor(p, c) {
        super(p, c);
    }

    startsWith(str: string, search: string) {
        return str.substr(0, search.length) === search;
    }

    shouldComponentUpdate(nextProps: SubItemsProps, nextState: SubItemsState) {
        if (this.props.selectedBranchId.substr(0, this.props.branchId.length) === this.props.branchId) {
            return true
        }

        if (nextProps.selectedBranchId.substr(0, nextProps.branchId.length) === nextProps.branchId) {
            return true
        }

        return false;
    }

    render() {
        var branch = style({
            paddingLeft: this.level == 1 ? 0 : this.level == 2 ? 60 : 20,// 20 + (this.hasIcon ? 0 : 0),/*+ (this.level * 10),*/
            display: this.props.isVisible === false ? "none" : "inherit",
            position: "relative",
            // $nest: {
            // }
        })
        var link = style({
            color: this.isThisMenuSelected ? "#f39100" : this.props.top ? "#FFF" : "#FFF",
            display: this.props.collapse ? "none" : "initial",
            paddingLeft: this.level == 1 ? 15 : 0,
        });
        var branchItem = style({
            marginTop: this.props.styleType === "button" ? 15 : 0,
            fontSize: 14,
            fontWeight: 500,
            fontStyle: "normal",
            fontStretch: "normal",
            //lineHeight: 2.29,
            minHeight: this.hasIcon || this.props.styleType === "button" ? 42 : 32,
            wordBreak: "break-all",
            letterSpacing: "normal",
            color: this.isThisMenuSelected ? "#f39100" : this.props.top ? "#FFF" : "#FFF",
            $nest: {
                ["& a"]: {
                    color: this.isThisMenuSelected ? "#f39100" : this.props.top ? "#FFF" : "#FFF",
                    //display: this.props.collapse ? "none" : "initial",
                },
            }
        });
        var meunuIcon = style({
            color: "#FFF",
            marginTop: 3,
            //position: this.props.collapse ? "relative" : "absolute",
            position: "relative",

            fontSize: 25,
            display: this.hasIcon ? "initial" : "none",
        });
        var innnerSubmenu = style({
            display: this.props.collapse ? "none" : "initial",
            $nest: {
                ["& > div"]: {
                    height: "100%",
                    overflow: "hidden",
                    maxHeight: 0,
                    transition: "max-height 1s",
                }
            }

        });
        var innnerSubmenuOpen = style({
            $nest: {
                ["& > div"]: {
                    maxHeight: 1000,
                    transition: "max-height 2.5s",
                }
            }

        });

        if (this.props.collapse) {
            return <div className={branch} data-branch={this.props.branchId} >
                <div className={branchItem} onClick={this.onClick} >
                    <span className={meunuIcon} >
                        <i className={this.props.icon} onClick={this.onClick} />
                    </span>
                    {this.textContentColapse}
                </div>
            </div>
        }

        var content = this.props.title

        if (this.props.styleType === "button") {
            content = <span
                style={{
                    paddingRight: 53,
                    paddingBottom: 12,
                    paddingLeft: 53,
                    paddingTop: 12,
                    borderRadius: 30,
                    borderColor: this.isThisMenuSelected ? "#f39100" : this.props.top ? "#FFF" : "#FFF",
                    borderWidth: 1,
                    borderStyle: "solid"
                }}
            >
                {this.props.title}
            </span>
        }

        return <div className={branch} data-branch={this.props.branchId} >
            <div className={branchItem} onClick={this.onClick} >
                <span className={meunuIcon} >
                    <i className={this.props.icon} onClick={this.onClick} />
                </span>
                <a className={link} onClick={this.onClickA} href={this.props.uri} >
                    {content}
                </a>
            </div>
            {this.anyChild ?
                <div className={innnerSubmenu + ((this.isMenuSelected === true || this.props.forceOpen === true) ? " " + innnerSubmenuOpen : "")} >
                    <SubMenu
                        top={this.props.top}
                        onBranchClick={this.props.onBranchClick}
                        branchId={this.props.branchId}
                        selectedBranchId={this.props.selectedBranchId}
                        open={this.props.open}
                        onMenuClick={this.props.onMenuClick}
                        childMenuItems={this.props.childMenuItems}
                        collapse={this.props.collapse}
                    />
                </div>
                : null}
        </div>
    }

    get textContentColapse() {
        if (this.props.icon != null && this.props.icon != "") {
            return null;
        }
        if (this.props.title != null && typeof (this.props.title) === "string") {
            return <span
                style={{
                    paddingRight: 10,
                    paddingBottom: 5,
                    paddingLeft: 10,
                    paddingTop: 5,
                    borderRadius: 30,
                    borderColor: this.isThisMenuSelected ? "#f39100" : this.props.top ? "#FFF" : "#FFF",
                    borderWidth: 1,
                    borderStyle: "solid"
                }}
            >
                {
                    this.props.title.substr(0, 2)
                }
            </span>
        }

        return null;
    }

    get hasIcon() {
        return this.props.icon != null && this.props.icon != "";
    }
    get level() {
        return branchIdHelper.getLevel(this.props.branchId);
    }

    LightenDarkenColor = (col: string, amt: number) => {
        var usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        var num = parseInt(col, 16);

        var r = (num >> 16) + amt;

        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        var b = ((num >> 8) & 0x00FF) + amt;

        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        var g = (num & 0x0000FF) + amt;

        if (g > 255) g = 255;
        else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }

    get anyChild() {
        var child = this.props.childMenuItems == null ? [] : this.props.childMenuItems.filter(x => x.isVisible == true && x.title != null);
        return child.length != 0;
    }

    get isMenuSelected() {
        if (this.props.top === false) {
            return this.props.selectedBranchId.substr(0, this.props.branchId.length) === this.props.branchId;
        }
        return this.isThisMenuSelected;
    }

    get isThisMenuSelected() {

        if (this.startsWith(this.props.selectedBranchId, this.props.branchId) && this.anyChild === false) {
            return true
        }

        return this.props.selectedBranchId === this.props.branchId;
    }

    onClick = (e) => {
        if (this.props.selectedBranchId.substr(0, this.props.branchId.length) === this.props.branchId) {
            this.SendBranchClick();
        } else {
            this.SendBranchClick();
        }

        //this.setState({ active: false });
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    onClickA = (e) => {
        this.SendBranchClick();
        var value = this.props.onMenuClick(this.props.uri);
        e.preventDefault();
    }

    private SendBranchClick = () => {
        this.props.onBranchClick(this.props.branchId);
    }

    private SendBranchParentClick = () => {
        var idParent = this.props.branchId.substr(0, this.props.branchId.length - 2);//this.props.branchId.substr(0, this.props.branchId.lastIndexOf("-"));
        this.props.onBranchClick(idParent);
    }
}