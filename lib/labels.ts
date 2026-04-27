import type { EventSource, EventStatus, EventType } from "@/lib/types";

export const eventTypeLabels: Record<EventType, string> = {
  earnings_release: "실적발표",
  provisional_earnings: "잠정실적",
  ir_meeting: "기업설명회",
  conference_call: "컨퍼런스콜",
  material_update: "IR 자료",
  webcast: "웹캐스트",
  business_report: "사업보고서",
  unknown: "미분류"
};

export const sourceLabels: Record<EventSource, string> = {
  dart: "DART",
  kind: "KIND",
  kirs: "KIRS",
  company_ir: "기업 IR",
  manual: "수동"
};

export const statusLabels: Record<EventStatus, string> = {
  scheduled: "예정",
  confirmed: "확정",
  changed: "변경",
  cancelled: "취소",
  completed: "종료",
  unknown: "확인 필요"
};
