import * as React from 'react';

import { IRollupFieldControlProps } from '../EntitiesDefinition';
import {  Field, FluentProvider, Input, Tooltip, webLightTheme } from '@fluentui/react-components';
import { Calculator20Regular } from '@fluentui/react-icons';

export interface IRollupFieldControlState {
  value?: string | null;
  date?: string;
  displayName?: string;
  updated?: string | null | undefined;
  result : "success" | "none" | "error" | "warning" | undefined;
}

export class RollupFieldControl extends React.Component<IRollupFieldControlProps, IRollupFieldControlState> {
  private readonly tooltipId = `easyrollup-${Math.random().toString(36).slice(2)}`;
  private clearMessageTimeout?: ReturnType<typeof setTimeout>;
  private mounted = false;
  private loadedForId?: string;
  private loading = false;

  constructor(props :IRollupFieldControlProps){
    super(props);
    this.state = { result : "none" };
  }

  public componentDidMount() {
    this.mounted = true;
    this.getData();
    this.loadDisplayName();
  }

  private get label(): string {
    return this.state.displayName || this.props.rollupField;
  }

  // Friendly name of the rollup column for messages; falls back to the logical name
  private async loadDisplayName() {
    const { context, entityRef, rollupField } = this.props;
    try {
      const metadata = await (context.utils as any).getEntityMetadata(entityRef.EntityName, [rollupField]);
      const attributes = metadata?.Attributes;
      const attribute = attributes?.getByName?.(rollupField) ?? attributes?.get?.(rollupField);
      if (attribute?.DisplayName)
        this.safeSetState({ displayName : attribute.DisplayName });
    }
    catch { /* keep the logical name */ }
  }

  public componentDidUpdate() {
    // The record id may only become available after the first render
    if (this.props.entityRef.Id && this.props.entityRef.Id !== this.loadedForId && !this.loading)
      this.getData();
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.clearMessageTimeout)
      clearTimeout(this.clearMessageTimeout);
  }

  private safeSetState(state: Partial<IRollupFieldControlState>) {
    if (this.mounted)
      this.setState(state as IRollupFieldControlState);
  }

  private refreshData = async () => {
    const { clientUrl, entityRef, rollupField } = this.props;
    if (!entityRef.Id) {
      this.safeSetState({ updated : `Save the record before refreshing ${this.label}.`, result : "warning" });
      return;
    }

    this.safeSetState({ updated : "Value is being refreshed.. Please wait.", result : "none" });
    const target = encodeURIComponent(`{'@odata.id':'${entityRef.EntitySetName}(${entityRef.Id})'}`);
    const url = `${clientUrl}/api/data/v9.0/CalculateRollupField(Target=@target,FieldName=@fieldname)?@target=${target}&@fieldname='${rollupField}'`;

    try {
      const response = await fetch(url, {
        method : "GET",
        headers : {
          "Accept" : "application/json",
          "Content-Type" : "application/json; charset=utf-8",
          "OData-MaxVersion" : "4.0",
          "OData-Version" : "4.0"
        }
      });

      if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
          message = (await response.json()).error?.message ?? message;
        } catch { /* body was not JSON */ }
        this.safeSetState({ updated : message, result : "error" });
        return;
      }

      await this.getData();
      this.safeSetState({ updated : `${this.label} was successfully updated.`, result : "success" });

      if (this.clearMessageTimeout)
        clearTimeout(this.clearMessageTimeout);
      this.clearMessageTimeout = setTimeout(() => {
        this.safeSetState({ updated : null, result : "none" });
      }, 3000);
    }
    catch (error) {
      this.safeSetState({ updated : "Error while refreshing data : " + (error as Error).message, result : "error" });
    }
  }

  // The raw _date is UTC; convert it to the time zone and format configured in the user's own settings.
  // Formatting is done here, from the user's short date/time patterns, so the result does not depend on
  // how the platform's formatDateShort treats the browser's time zone.
  private formatUserLocalDate(rawDate?: string | null): string | undefined {
    if (!rawDate)
      return undefined;

    const utc = new Date(rawDate);
    if (isNaN(utc.getTime()))
      return undefined;

    const { formatting, userSettings } = this.props.context;
    try {
      // Wall-clock time in the user's CRM time zone, read back through the UTC getters
      const wall = new Date(utc.getTime() + userSettings.getTimeZoneOffsetMinutes(utc) * 60000);
      const info = userSettings.dateFormattingInfo;
      const pad = (n: number) => n.toString().padStart(2, "0");
      const hours12 = wall.getUTCHours() % 12 === 0 ? 12 : wall.getUTCHours() % 12;

      const render = (pattern: string) => pattern.replace(/yyyy|yy|MMMM|MMM|MM|M|dd|d|hh|h|HH|H|mm|m|tt|t|\/|:/g, token => {
        switch (token) {
          case "yyyy": return wall.getUTCFullYear().toString();
          case "yy": return pad(wall.getUTCFullYear() % 100);
          case "MMMM": return info.monthNames[wall.getUTCMonth()];
          case "MMM": return info.abbreviatedMonthNames[wall.getUTCMonth()];
          case "MM": return pad(wall.getUTCMonth() + 1);
          case "M": return (wall.getUTCMonth() + 1).toString();
          case "dd": return pad(wall.getUTCDate());
          case "d": return wall.getUTCDate().toString();
          case "hh": return pad(hours12);
          case "h": return hours12.toString();
          case "HH": return pad(wall.getUTCHours());
          case "H": return wall.getUTCHours().toString();
          case "mm": return pad(wall.getUTCMinutes());
          case "m": return wall.getUTCMinutes().toString();
          case "tt": return wall.getUTCHours() < 12 ? info.amDesignator : info.pmDesignator;
          case "t": return (wall.getUTCHours() < 12 ? info.amDesignator : info.pmDesignator).charAt(0);
          case "/": return info.dateSeparator;
          case ":": return info.timeSeparator;
          default: return token;
        }
      });

      return `${render(info.shortDatePattern)} ${render(info.shortTimePattern)}`;
    }
    catch {
      return formatting.formatDateShort(utc, true);
    }
  }

  private getData = async () => {
    const { context, entityRef, rollupField } = this.props;
    if (!entityRef.Id)
      return; // new record, nothing to retrieve yet

    this.loading = true;
    this.loadedForId = entityRef.Id;

    try {
      const result = await context.webAPI.retrieveRecord(entityRef.EntityName, entityRef.Id, `?$select=${rollupField},${rollupField}_date`);
      const formattedKey = "@OData.Community.Display.V1.FormattedValue";
      const raw = result[rollupField];

      // The server-formatted value is correct for every type (currency, decimal, whole number, ...)
      this.safeSetState({
        value : raw == null ? null : (result[`${rollupField}${formattedKey}`] ?? String(raw)),
        date : this.formatUserLocalDate(result[`${rollupField}_date`]) ?? result[`${rollupField}_date${formattedKey}`] ?? undefined
      });
    }
    catch (error) {
      this.safeSetState({
        updated : "Error while getting data : " + (error as Error).message,
        result : "error"
      });
    }
    finally {
      this.loading = false;
    }
  }

  public render(): React.ReactNode {
    // A bound column gets its label from the form; only draw one when the control stands alone
    const showLabel = this.props.isUnbound && this.props.labelPosition !== "Hidden";
    const labelText = showLabel ? (this.props.label || this.state.displayName) : undefined;
    const labelOnTop = this.props.labelPosition === "Top";
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: labelOnTop ? "column" : "row", alignItems: labelOnTop ? "stretch" : "flex-start" }}>
        {labelText && (
          <label style={labelOnTop ? { paddingBottom: "4px", fontFamily: "inherit", fontSize: "14px" } : { flex: `0 0 ${Math.min(Math.max(this.props.labelWidthPx, 40), 600)}px`, paddingTop: "6px", boxSizing: "border-box", fontFamily: "inherit", fontSize: "14px" }}>
            {labelText}
          </label>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
        <FluentProvider theme={webLightTheme}>
          <Tooltip 
            content={this.state.date ? `Last refreshed on ${this.state.date}` : "Not refreshed yet"}
            relationship="label"
            withArrow
            positioning={"above-start"}
          >
            <Field
              validationState={this.state.result ?? "none"}
              validationMessage={this.state.updated}
            >
              <Input
                readOnly
                value={this.state.value ?? ""}
                type="text"
                aria-describedby={this.tooltipId}
                style={{backgroundColor: "#F5F5F5", border: "none"}}
                contentAfter={<Calculator20Regular onClick={() => { this.refreshData(); }} />} 
              />
            </Field>
          </Tooltip>
        </FluentProvider> 
        </div>
      </div>
    )
  }
}
