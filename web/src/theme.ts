import { createTheme, MantineColorsTuple } from "@mantine/core";

const polarCyan: MantineColorsTuple = [
  "#dffdff",
  "#cef6fc",
  "#a4e9f4",
  "#75dcec",
  "#4fd1e5",
  "#36cae1",
  "#1fc7e0",
  "#00b0c7",
  "#009db3",
  "#00889d",
];

export const theme = createTheme({
  colors: {
    polarCyan,
  },
  primaryColor: "polarCyan",
  defaultRadius: "md",
});
