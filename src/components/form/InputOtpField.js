import React, { useState } from "react";
import { Form, Input } from "antd";
import useFormField from "../hooks/useFormField";

const InputOtpField = ({
  label = "",
  name = "",
  className,
  formItemProps,
  fieldProps,
  size,
  type,
  style,
  inputCount = 4,
  ...props
}) => {
  const { rules, placeholder } = useFormField(props);
  const [value, setValue] = useState("");
  const formatNumber = (value) => new Intl.NumberFormat().format(value);

  const NumericInput = (props) => {
    const { value, onChange } = props;

    const handleChange = (inputValue) => {
      const reg = /^-?\d*(\.\d*)?$/;
      if (reg.test(inputValue) || inputValue === "" || inputValue === "-") {
        onChange(inputValue);
      }
    };

    const handleBlur = () => {
      let valueTemp =
        typeof value === "undefined" || value === null ? "" : value;

      if (valueTemp.charAt(valueTemp.length - 1) === "." || valueTemp === "-") {
        valueTemp = valueTemp.slice(0, -1);
      }
      onChange(valueTemp.replace(/0*(\d+)/, "$1"));
    };

    const title = value ? (
      <span className="numeric-input-title">
        {value !== "-" ? formatNumber(Number(value)) : "-"}
      </span>
    ) : (
      "Input a number"
    );

    return (
      <Input.OTP
        {...props}
        length={inputCount}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Input a number"
        maxLength={16}
      />
    );
  };

  return (
    <Form.Item
      label={label}
      name={name}
      validateFirst
      rules={rules}
      {...formItemProps}
      style={style}
    >
      <NumericInput
        {...fieldProps}
        className={className}
        placeholder={placeholder}
        size={"large"}
        type={type}
      />
    </Form.Item>
  );
};

export default InputOtpField;
