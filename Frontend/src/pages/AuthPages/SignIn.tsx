import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta title="Rivermonitor | Sign In" description="Sign in to your Rivermonitor account" />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
