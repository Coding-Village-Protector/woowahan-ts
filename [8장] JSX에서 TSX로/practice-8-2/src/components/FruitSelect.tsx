import { FC, useState } from "react";
import Select from "./Select";

type Fruit = keyof typeof fruits; // 'apple' | 'banana' | 'blueberry';

const fruits = { apple: "사과", banana: "바나나", blueberry: "블루베리" };

const FruitSelect: FC = () => {
  const [fruit, changeFruit] = useState<Fruit | undefined>("apple");
  return (
    <>
      <Select onChange={changeFruit} options={fruits} selectedOption={fruit} />
      <p>지금 고른 과일은 {fruit}야</p>
    </>
  );
};

export default FruitSelect;
