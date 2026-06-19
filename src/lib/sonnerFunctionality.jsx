import { TrashIcon } from "lucide-react";
import { eliteDateFormat } from "./utils";

export const sonnerFunctionality = ({IconParam = TrashIcon}) => ({
  description: eliteDateFormat(),
  action: {
    label: <IconParam size={16} />,
    onClick: () => {},
  },
});