import Translate, { translate } from '@docusaurus/Translate';
import React from 'react';

import './keys/dataset';

export default function Translator({ id }) {
  const message = translate({ message: id });
  console.log(message);
  return message;
}
