import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="AIDA | Sign In"
        description="Sign in to your AIDA account"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
