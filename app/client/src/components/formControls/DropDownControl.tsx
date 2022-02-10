import React from "react";
import BaseControl, { ControlProps } from "./BaseControl";
import styled from "styled-components";
import Dropdown, { DropdownOptionType } from "components/ads/Dropdown";
import { ControlType } from "constants/PropertyControlConstants";
import _ from "lodash";
import {
  Field,
  WrappedFieldInputProps,
  WrappedFieldMetaProps,
} from "redux-form";
import { DynamicValues } from "reducers/evaluationReducers/formEvaluationReducer";

const DropdownSelect = styled.div`
  font-size: 14px;
  width: 20vw;
`;

class DropDownControl extends BaseControl<DropDownControlProps> {
  render() {
    let width = "20vw";
    if (
      "customStyles" in this.props &&
      !!this.props.customStyles &&
      "width" in this.props.customStyles
    ) {
      width = this.props.customStyles.width;
    }

    // Options will be set dynamically if the config has fetchOptionsConditionally set to true
    let options = this.props.options;
    let isLoading = false;
    if (
      this.props.fetchOptionsCondtionally &&
      !!this.props.dynamicFetchedValues
    ) {
      options = this.props.dynamicFetchedValues.data;
      isLoading = this.props.dynamicFetchedValues.isLoading;
    }

    return (
      <DropdownSelect data-cy={this.props.configProperty} style={{ width }}>
        <Field
          component={renderDropdown}
          name={this.props.configProperty} // Passing options and isLoading in props allows the component to get the updated values
          props={{ ...this.props, width, isLoading, options }}
          type={this.props?.isMultiSelect ? "select-multiple" : undefined}
        />
      </DropdownSelect>
    );
  }

  getControlType(): ControlType {
    return "DROP_DOWN";
  }
}

function renderDropdown(props: {
  isMultiSelect?: boolean;
  input?: WrappedFieldInputProps;
  meta?: WrappedFieldMetaProps;
  props: DropDownControlProps;
  width: string;
  formName: string;
  isLoading?: boolean;
  options: DropdownOptionType[];
  disabled?: boolean;
}): JSX.Element {
  let selectedValue = props.isMultiSelect ? [] : props.input?.value;

  if (_.isUndefined(props.input?.value)) {
    selectedValue = props?.props?.initialValue;
  }

  let selectedOption = selectedValue;

  if (props.isMultiSelect) {
    if (typeof props.options[0] === "string") {
    } else {
    }
  } else {
    if (typeof props.options[0] === "string") {
      selectedOption = props.options.find(
        (option: DropdownOptionType) => option === selectedValue,
      );
    } else {
      selectedOption = props.options.find(
        /* eslint-disable */
        //@ts-ignore
        (option: DropdownOptionType) => option.value === selectedValue,
      );
    }
  }

  return (
    <Dropdown
      boundary="window"
      disabled={props.disabled}
      dontUsePortal={false}
      dropdownMaxHeight="250px"
      errorMsg={props.props?.errorText}
      helperText={props.props?.info}
      isLoading={props.isLoading}
      isMultiSelect={props?.isMultiSelect}
      onSelect={props.input?.onChange}
      optionWidth={props.width}
      options={props.options}
      placeholder={props.props?.placeholderText}
      selected={selectedOption}
      showLabelOnly
      width={props.width}
    />
  );
}

export interface DropDownControlProps extends ControlProps {
  options: DropdownOptionType[];
  placeholderText: string;
  propertyValue: string;
  subtitle?: string;
  isMultiSelect?: boolean;
  isSearchable?: boolean;
  fetchOptionsCondtionally?: boolean;
  dynamicFetchedValues?: DynamicValues;
}

export default DropDownControl;
