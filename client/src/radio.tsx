
import { Radio, RadioGroup} from '@chakra-ui/radio'
import React, { useEffect, useState} from "react";
import Stack from 'react-bootstrap/Stack';

export function RadioExample() {
  const [value, setValue] = React.useState('1')

  useEffect(()=>{console.log(value)},[value])
  return (
    <RadioGroup onChange={setValue} value={value}>
      <Stack direction='horizontal'>
        <Radio  colorScheme='red' value='1'>Firsssss</Radio>
        <Radio value='2'>Second</Radio>
        <Radio value='3'>Third</Radio>
      </Stack>
    </RadioGroup>
  )
}