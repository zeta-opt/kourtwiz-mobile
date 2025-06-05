import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { View } from "react-native";
import AddressStep from "./components/AddressStep";
import DoneStep from "./components/DoneStep";
import InfoStep from "./components/InfoStep";
import PictureStep from "./components/PictureStep";
import SecurityStep from "./components/SecurityStep";
import Stepper from "./components/Stepper";
import VerifyStep from "./components/VerifyStep";
import styles from "./SignupFlow.styles";

const steps = ["Info", "Verify", "Security", "Address", "Picture", "Done"];

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = new QueryClient();
  const goToNext = () => setCurrentStep((prev) => prev + 1);
  const goToPrev = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <InfoStep onNext={goToNext} />;
      case 1:
        return <VerifyStep onNext={goToNext} onBack={goToPrev} />;
      case 2:
        return <SecurityStep onNext={goToNext} onBack={goToPrev} />;
      case 3:
        return <AddressStep onNext={goToNext} onBack={goToPrev} />;
      case 4:
        return <PictureStep onNext={goToNext} onBack={goToPrev} />;
      case 5:
        return <DoneStep />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <View style={styles.stepperWrapper}>
          <Stepper
            steps={["Info", "Verify", "Security", "Address", "Picture", "Done"]}
            currentStep={currentStep}
            onStepPress={(step) => setCurrentStep(step)}
          />
        </View>
        <View style={styles.contentWrapper}>{renderStep()}</View>
      </QueryClientProvider>
    </View>
  );
};

export default SignupFlow;
