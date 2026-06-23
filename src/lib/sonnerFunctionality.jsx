import { TrashIcon } from "lucide-react";
import { eliteDateFormat } from "./utils";

export const sonnerFunctionality = (IconParam = TrashIcon) => ({
  description: eliteDateFormat(),
  action: {
    label: <IconParam size={16} />,
    onClick: () => {},
  },
});


/*
import dynamic from "next/dynamic";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { eliteDateFormat } from "./utils";

export const DynamicIcon = ({name = "TrashIcon", size = 16, ...props}) => {
  const assignedIcon = dynamic(dynamicIconImports[name]);

  return <assignedIcon size={size} {...props} />;
};

export const sonnerFunctionality = ({
  IconParam = "TrashIcon",
  descriptionPassed = eliteDateFormat()
}) => ({
  description: descriptionPassed,
  action: {
    label: <DynamicIcon name={IconParam} />,
    onClick: () => {},
  },
});

*/