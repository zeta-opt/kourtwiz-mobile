import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type StepperProps = {
  steps: string[];
  currentStep: number;
  onStepPress: (stepIndex: number) => void;
};

const Stepper = ({ steps, currentStep, onStepPress }: StepperProps) => (
  <View style={styles.container}>
    {steps.map((label, index) => {
      const isCompleted = index < currentStep;
      const isActive = index === currentStep;

      return (
        <React.Fragment key={index}>
          <TouchableOpacity style={styles.step} onPress={() => onStepPress(index)}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isActive && styles.activeCircle
              ]}
            >
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text
              style={[
                styles.label,
                isCompleted && styles.completedLabel,
                isActive && styles.activeLabel
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>

          {/* Render line except after the last step */}
          {index !== steps.length - 1 && (
            <View
              style={[
                styles.line,
                index < currentStep
                  ? styles.completedLine
                  : styles.upcomingLine
              ]}
            />
          )}
        </React.Fragment>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    width: 50,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  completedCircle: {
    backgroundColor: '#20C997', 
  },
  completedLabel: {
    color: '#20C997',
  },
  completedLine: {
    backgroundColor: '#20C997',
  },
  activeCircle: {
    backgroundColor: '#007bff'
  },
  stepNumber: {
    color: '#fff',
    fontWeight: 'bold'
  },
  label: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: '#FFF'
  },

  activeLabel: {
    color: '#007bff'
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 24,
  },
 
  upcomingLine: {
    backgroundColor: '#ccc',
    color:'white'
  }
});

export default Stepper;
