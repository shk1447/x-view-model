import React from "react";
import { Units, Theme } from "vases-ui";

function App() {
  const theme = Theme.createMyTheme('light',{
    typography: {
      button: {
        textTransform:'none'
      }
    },
    custom: {
      design:{
        pallete: {
          neutral: {
            black: "",
            white: "",
            grey100: "",
            grey80: "",
            grey60: "",
            grey20: "",
            grey10: "",
            grey5: ""
          },
          brand: {
            navy: "",
            orange: "",
            skyblue: "",
            turquoise: ""
          },
          semantic: {
            success: "",
            warning: "",
            error100: "",
            error110: ""
          },
          primary110: "",
          primary100: "",
          primary60: "",
          primary40: "",
          primary20: ""
        }
      }
    },
    custom_mode:'ligth'

  })

  const _theme = Theme.useMyTheme();

  return (
    <Theme.ThemeProvider theme={theme}>
      <Units.LoadingButton loading={true}>test</Units.LoadingButton>
      <Units.Button variant="contained" color="primary">Button</Units.Button>
    </Theme.ThemeProvider>
  );
}

export default App;
