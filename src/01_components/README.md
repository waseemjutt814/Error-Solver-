# 🧩 Components Directory

This folder holds all your reusable UI components (Buttons, Cards, Inputs, etc).

## How to use the Numbered Pipeline here:
When creating components that map to a specific flow in your app, use the Error Solver naming convention so the architecture graph can automatically map your UI!

### Examples:
- `010_LoginButton_STARTto011.tsx` (Starts the login flow)
- `011_AuthForm_010to012.tsx` (Contains the button and inputs)
- `050_UserAvatar_MULTtoEND.tsx` (Used in many places, no further flow)

> **Tip:** Reusable components that are used everywhere can use `MULT` as their input.
