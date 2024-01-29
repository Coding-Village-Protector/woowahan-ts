/**
 * Select 컴포넌트
 * @param {Object} props - Select 컴포넌트로 넘겨주는 속성
 * @param {Object} props.options - { [key: string]: string } 형식으로 이루어진 option 객체
 * @param {string | undefined} props.selectedOption - 현재 선택된 option의 key값 (optional)
 * @param {function} props.onChange - select 값이 변경되었을 때 불리는 callBack 함수 (optional)
 * @returns {JSX.Element}
 */

import { SelectStyleProps, StyledSelect } from "../styles/Select.styles";

type ReactSelectProps = React.ComponentPropsWithoutRef<"select">;

interface SelectProps<OptionType extends Record<string, string>>
  extends Pick<ReactSelectProps, "id" | "key">,
    Partial<SelectStyleProps> {
  options: OptionType;
  selectedOption?: keyof OptionType;
  onChange?: (selected?: keyof OptionType) => void;
}

const Select = <OptionType extends Record<string, string>>({
  options,
  selectedOption,
  onChange,
  fontSize = "default",
  color = "orange",
}: SelectProps<OptionType>) => {
  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const selected = Object.entries(options).find(
      ([_, value]) => value === e.target.value
    )?.[0];
    onChange?.(selected);
  };

  return (
    <StyledSelect
      onChange={handleChange}
      value={selectedOption && options[selectedOption]}
      fontSize={fontSize}
      color={color}
    >
      {Object.entries(options).map(([key, value]) => (
        <option key={key} value={value}>
          {value}
        </option>
      ))}
    </StyledSelect>
  );
};

export default Select;
