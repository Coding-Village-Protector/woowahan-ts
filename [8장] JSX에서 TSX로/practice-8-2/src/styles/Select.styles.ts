import { styled } from "styled-components";
import { Color, FontSize, theme } from "./Theme.styles";

export interface SelectStyleProps {
  color: Color;
  fontSize: FontSize;
}

export const StyledSelect = styled.select<SelectStyleProps>`
  color: ${({ color }) => theme.color[color]};
  font-size: ${({ fontSize }) => theme.fontSize[fontSize]};
`;
