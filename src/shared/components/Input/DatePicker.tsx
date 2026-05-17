import React, { useRef, useCallback, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

import { KeyCodeUtils } from "utils";
import './DatePicker.scss';

interface IDatePickerProps {
  value?: any;
  onChange: (dates: Date[]) => void;
  minDate?: Date | string;
  onClose?: () => void;
  className?: string;
  placeholder?: string;
  [key: string]: any;
}

// Hằng số cho date format
const SEPERATOR = "/";
const DATE_FORMAT_AUTO_FILL = "d/m/Y";
const DISPLAY_FORMAT = "d/m/Y";

const DatePicker: React.FC<IDatePickerProps> = ({ value, onChange, minDate, onClose, ...otherProps }) => {
  const flatpickrRef = useRef<any>(null);
  const flatpickrNodeRef = useRef<any>(null);

  const handleBlur = useCallback((event: any) => {
    const val = event.target.value;
    event.preventDefault();
    if (!val) return;
    const valueMoment = moment(val, 'DD/MM/YYYY');
    if (!valueMoment.isValid()) return;
    onChange([valueMoment.toDate(), valueMoment.toDate()]);
  }, [onChange]);

  const handlerKeyDown = useCallback((event: any) => {
    const keyCode = event.which || event.keyCode;
    if (keyCode === KeyCodeUtils.ENTER) {
      event.preventDefault();
      const val = event.target.value;
      if (!val) return;
      const valueMoment = moment(val, 'DD/MM/YYYY');
      if (!valueMoment.isValid()) return;
      onChange([valueMoment.toDate(), valueMoment.toDate()]);
    }
  }, [onChange]);

  // Cleanup event listeners khi unmount
  useEffect(() => {
    return () => {
      const node = flatpickrNodeRef.current;
      if (node) {
        node.removeEventListener('blur', handleBlur);
        node.removeEventListener('keydown', handlerKeyDown);
      }
    };
  }, [handleBlur, handlerKeyDown]);

  const nodeRef = useCallback((element: any) => {
    flatpickrRef.current = element && element.flatpickr;
    flatpickrNodeRef.current = element && element.node;
    if (flatpickrNodeRef.current) {
      flatpickrNodeRef.current.addEventListener('blur', handleBlur);
      flatpickrNodeRef.current.addEventListener('keydown', handlerKeyDown);
    }
  }, [handleBlur, handlerKeyDown]);

  const onOpen = useCallback(() => {
    if (flatpickrNodeRef.current) {
      flatpickrNodeRef.current.blur();
    }
  }, []);

  const checkDateValue = useCallback((str: string, max: number) => {
    if (str.charAt(0) !== '0' || str === '00') {
      var num = parseInt(str);
      if (isNaN(num) || num <= 0 || num > max) num = 1;
      str = num > parseInt(max.toString().charAt(0)) && num.toString().length === 1 ? '0' + num : num.toString();
    }
    return str;
  }, []);

  const autoFormatOnChange = useCallback((val: string, sep: string) => {
    var input = val;
    let regexForDeleting = new RegExp(`\\D\\${sep}$`);
    if (regexForDeleting.test(input)) input = input.substr(0, input.length - 3);
    var values = input.split(sep).map(function (v) {
      return v.replace(/\D/g, '');
    });
    if (values[0]) values[0] = checkDateValue(values[0], 31);
    if (values[1]) values[1] = checkDateValue(values[1], 12);
    var output = values.map(function (v, i) {
      return v.length === 2 && i < 2 ? v + ' ' + sep + ' ' : v;
    });
    return output.join('').substr(0, 14);
  }, [checkDateValue]);

  const onInputChange = useCallback((e: any) => {
    if (DISPLAY_FORMAT === DATE_FORMAT_AUTO_FILL) {
      let converted = autoFormatOnChange(e.target.value, SEPERATOR);
      e.target.value = converted;
    }
  }, [autoFormatOnChange]);

  const options: any = {
    dateFormat: DISPLAY_FORMAT,
    allowInput: true,
    disableMobile: true,
    onClose: onClose,
    onOpen: onOpen,
  };
  if (minDate) {
    options.minDate = minDate;
  }

  return (
    <Flatpickr
      ref={nodeRef}
      value={value}
      onChange={onChange}
      options={options}
      {...otherProps}
    />
  );
};

export default DatePicker;
