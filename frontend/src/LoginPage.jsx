import { useActionState, useId } from "react";
import { Link, useNavigate } from "react-router";
import { VALID_ROUTES } from "../../shared/ValidRoutes.js";
import "./LoginPage.css";

const REGISTER_ENDPOINT = "/api/register";
const LOGIN_ENDPOINT = "/api/login";

export function LoginPage({ isRegistering = false, onAuthToken }) {
    const usernameInputId = useId();
    const emailInputId = useId();
    const passwordInputId = useId();
    const navigate = useNavigate();

    const [errorMessage, formAction, isPending] = useActionState(async (_, formData) => {
        const username = String(formData.get("username") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const email = String(formData.get("email") ?? "").trim();

        if (!username || !password || (isRegistering && !email)) {
            return "Please fill out all required fields.";
        }

        const payload = isRegistering
            ? { username, email, password }
            : { username, password };

        const endpoint = isRegistering ? REGISTER_ENDPOINT : LOGIN_ENDPOINT;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let message = `Error: HTTP ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    if (errorBody?.message) {
                        message = errorBody.message;
                    }
                } catch {
                    // Ignore JSON parse errors for error responses.
                }
                return message;
            }

            const data = await response.json();
            const authToken = data?.token ?? data?.authToken;
            if (authToken) {
                console.log(authToken);
                onAuthToken?.(authToken);
                navigate(VALID_ROUTES.HOME);
            } else if (isRegistering) {
                console.log("Successfully created account");
            }

            return "";
        } catch (err) {
            return err instanceof Error ? err.message : String(err);
        }
    }, "");

    const headerText = isRegistering ? "Register a new account" : "Login";
    const linkText = isRegistering ? "Already have an account? " : "Don't have an account? ";
    const linkTarget = isRegistering ? VALID_ROUTES.LOGIN : VALID_ROUTES.REGISTER;
    const linkLabel = isRegistering ? "Login here" : "Register here";

    return (
        <div>
            <h2>{headerText}</h2>
            <form className="LoginPage-form" action={formAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input id={usernameInputId} name="username" required disabled={isPending} />

                {isRegistering && (
                    <>
                        <label htmlFor={emailInputId}>Email</label>
                        <input id={emailInputId} name="email" type="email" required disabled={isPending} />
                    </>
                )}

                <label htmlFor={passwordInputId}>Password</label>
                <input id={passwordInputId} name="password" type="password" required disabled={isPending} />

                <input type="submit" value="Submit" disabled={isPending} />
            </form>

            <p>
                {linkText}
                <Link to={linkTarget}>{linkLabel}</Link>
            </p>

            <div aria-live="polite">
                {errorMessage && <p>{errorMessage}</p>}
            </div>
        </div>
    );
}
