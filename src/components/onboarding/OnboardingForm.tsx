"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import type { UserProfile } from "@/lib/scenario/types";
import { OnboardingCopyright } from "@/components/onboarding/OnboardingCopyright";

const onboardingFormSchema = z.object({
  displayName: z
    .string()
    .min(1, "이름(가명도 좋아요)을 입력해주세요")
    .max(20, "20자 이내로 입력해주세요"),
  userAge: z
    .number({ error: "숫자로 입력해주세요" })
    .int("정수로 입력해주세요")
    .min(10, "10세 이상부터 이용할 수 있어요")
    .max(120, "나이를 다시 확인해주세요"),
  gender: z.enum(["female", "male"], { error: "성별을 선택해주세요" }),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

interface OnboardingFormProps {
  onProfileSubmit: (profileValue: UserProfile) => void;
  /** 시나리오 추천 화면에서 돌아온 경우 기존 입력값을 채움 */
  initialProfile?: UserProfile;
}

export function OnboardingForm({ onProfileSubmit, initialProfile }: OnboardingFormProps) {
  const isEditingProfile = !!initialProfile;

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: initialProfile,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-sm flex-col gap-6 px-6"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditingProfile ? "내 정보 수정" : "Trust or Trap"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {isEditingProfile ? (
            <>
              잘못 입력했나요? 수정 후 다시 시나리오를 확인할 수 있어요.
            </>
          ) : (
            <>
              당신의 폰에서 벌어지는 실전 시뮬레이션.
              <br />
              위험 신호를 스스로 찾아내 보세요.
            </>
          )}
        </p>
      </div>

      <form
        onSubmit={handleSubmit((formValues) => onProfileSubmit(formValues))}
        className="flex flex-col gap-4"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white/80">이름 (가명 가능)</span>
          <input
            {...register("displayName")}
            placeholder="예: 지민"
            autoComplete="off"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base outline-none focus:border-sky-400"
          />
          {formErrors.displayName && (
            <span className="text-xs text-red-400">{formErrors.displayName.message}</span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-white/80">나이</span>
          <input
            {...register("userAge", { valueAsNumber: true })}
            type="number"
            inputMode="numeric"
            placeholder="예: 24"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base outline-none focus:border-sky-400"
          />
          {formErrors.userAge && (
            <span className="text-xs text-red-400">{formErrors.userAge.message}</span>
          )}
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm text-white/80">성별</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center has-[:checked]:border-sky-400 has-[:checked]:bg-sky-400/15">
              <input type="radio" value="female" {...register("gender")} className="sr-only" />
              여성
            </label>
            <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center has-[:checked]:border-sky-400 has-[:checked]:bg-sky-400/15">
              <input type="radio" value="male" {...register("gender")} className="sr-only" />
              남성
            </label>
          </div>
          {formErrors.gender && (
            <span className="text-xs text-red-400">{formErrors.gender.message}</span>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-xl bg-sky-500 py-3.5 text-base font-semibold transition hover:bg-sky-400 disabled:opacity-50"
        >
          {isEditingProfile ? "수정 완료" : "시작하기"}
        </button>
      </form>

      <p className="text-center text-xs text-white/40">
        입력한 정보는 시나리오 매칭에만 사용되며 이 기기에만 저장됩니다.
      </p>

      <div className="flex justify-center">
        <OnboardingCopyright />
      </div>
    </motion.div>
  );
}
