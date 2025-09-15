import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import AddressStep from "./components/AddressStep";
import DoneStep from "./components/DoneStep";
import InfoStep from "./components/InfoStep";
import PictureStep from "./components/PictureStep";
import SecurityStep from "./components/SecurityStep";
import Stepper from "./components/Stepper";
import VerifyStep from "./components/VerifyStep";
import styles from "./SignupFlow.styles";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
        return <DoneStep onRetry={(step: number) => setCurrentStep(step)} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        {currentStep === 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, marginLeft: 8,}}>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.stepperWrapper}>
          <Stepper
            steps={["Info", "Verify", "Security", "Address", "Picture", "Done"]}
            currentStep={currentStep}
            onStepPress={(step) => setCurrentStep(step)}
          />
        </View>
        <View style={styles.contentWrapper}>{renderStep()}</View>
      </QueryClientProvider>
    </SafeAreaView>
  );
};

export default SignupFlow;
