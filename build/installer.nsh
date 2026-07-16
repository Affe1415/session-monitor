!macro customInstall
  !ifndef BUILD_UNINSTALLER
    StrCpy $0 "$INSTDIR\resources\icon.ico"

    !ifndef DO_NOT_CREATE_DESKTOP_SHORTCUT
      ${If} ${FileExists} "$newDesktopLink"
        Delete "$newDesktopLink"
        CreateShortCut "$newDesktopLink" "$appExe" "" "$0" 0 "" "" "${APP_DESCRIPTION}"
      ${EndIf}
    !endif

    !ifndef DO_NOT_CREATE_START_MENU_SHORTCUT
      ${If} ${FileExists} "$newStartMenuLink"
        Delete "$newStartMenuLink"
        CreateShortCut "$newStartMenuLink" "$appExe" "" "$0" 0 "" "" "${APP_DESCRIPTION}"
      ${EndIf}
    !endif
  !endif
!macroend
