/**
 * Copyright (c) 2014-present PlatformIO <contact@platformio.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  CONFIG_TEXTAREA_AUTOSIZE,
  TYPE_BOOL,
  TYPE_CHOICE,
  TYPE_FILE,
  TYPE_INT,
  TYPE_INT_RANGE,
  TYPE_TEXT,
} from '@project/constants';
import { Checkbox, Input, Select } from 'antd';

import React from 'react';

export function splitMultipleField(v) {
  if (v == undefined) {
    return;
  }
  return v
    .split(v.includes('\n') ? /\n/ : /, /)
    .map((v) => v.replace(/^\s+|\s+$/g, ''))
    .filter((v, i) => v.length || i);
}

export function getConfigOptionValue(data, name) {
  const option = data.find((o) => o.name === name) || {};
  return option.value;
}

class OptionEditorFactoryImpl {
  constructor() {
    this.factories = [];
  }

  register(matcher, factoryCallback) {
    if (!this.factories.find((f) => f.matcher === matcher)) {
      this.factories.push({
        matcher,
        factoryCallback,
      });
    }
  }

  isCustomized(schema) {
    return this.factories.findIndex((f) => f.matcher(schema)) !== -1;
  }

  factory(schema, inputProps, itemProps, decoratorOptions, project) {
    const factory = this.factories.find((f) => f.matcher(schema));
    if (!factory) {
      return this.defaultFactory(
        schema,
        inputProps,
        itemProps,
        decoratorOptions,
        project
      );
    }
    return factory.factoryCallback(
      schema,
      inputProps,
      itemProps,
      decoratorOptions,
      project
    );
  }

  defaultFactory(schema, inputProps, itemProps, decoratorOptions) {
    const type = schema ? schema.type : TYPE_TEXT;
    const multiple = !schema || schema.multiple;
    const description = schema ? schema.description : undefined;

    let result;
    switch (type) {
      case TYPE_BOOL:
        result = <Checkbox autoFocus={inputProps.autoFocus}>{description}</Checkbox>;
        decoratorOptions.valuePropName = 'defaultChecked';
        decoratorOptions.trigger = 'onChange';
        itemProps.help = undefined;

        if (decoratorOptions.initialValue === undefined) {
          decoratorOptions.initialValue = inputProps.defaultValue;
        }
        break;

      case TYPE_CHOICE:
        result = (
          <Select
            autoFocus={inputProps.autoFocus}
            placeholder={inputProps.defaultValue}
            mode={multiple ? 'multiple' : 'default'}
            tokenSeparators={[',', '\n']}
          >
            {schema.choices.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
        break;

      case TYPE_TEXT:
      case TYPE_FILE:
      case TYPE_INT:
      case TYPE_INT_RANGE:
      default:
        if (multiple) {
          result = (
            <Input.TextArea
              autoFocus={inputProps.autoFocus}
              placeholder={inputProps.defaultValue}
              autoSize={CONFIG_TEXTAREA_AUTOSIZE}
              rows={1}
            />
          );
        } else {
          result = (
            <Input
              autoFocus={inputProps.autoFocus}
              placeholder={inputProps.defaultValue}
              readOnly={schema && schema.readonly}
            />
          );
        }
        if (!type) {
          console.warn(`Unsupported item type: "${type}" for name: "${name}"`);
          // throw new Error(`Unsupported item type: "${type}"`);
        }
        break;
    }
    return result;
  }
}

export const OptionEditorFactory = new OptionEditorFactoryImpl();
