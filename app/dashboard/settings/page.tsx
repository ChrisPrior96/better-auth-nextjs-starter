import {
    RedirectToSignIn,
    SignedIn,
    SettingsCards
} from "@daveyplate/better-auth-ui"
 
export default function CustomSettingsPage() {
    return (
        <>
            <RedirectToSignIn />
            
            <SignedIn>
                <SettingsCards />
            </SignedIn>
        </>
    )
}