#ifdef HAVE_BAGL
#include "menu.h"

#ifdef HAVE_ON_DEVICE_UNIT_TESTS
UX_STEP_NOCB(
    ux_idle_flow_1_step,
    pnn,
    {
      &C_mina_logo,
      "Mina",
      "unit tests",
    });
#else
UX_STEP_NOCB(
    ux_idle_flow_1_step,
    pnn,
    {
      &C_mina_logo,
      "Mina",
      "is ready",
    });
#endif
UX_STEP_NOCB(
    ux_idle_flow_2_step,
    bn,
    {
      "Version",
      APPVERSION,
    });
UX_STEP_NOCB(
    ux_idle_flow_3_step,
    bn,
    {
      "Developer",
      "Jspada",
    });
UX_STEP_NOCB(
    ux_idle_flow_4_step,
    bn,
    {
      "Modifications by",
      "Zondax AG",
    });
UX_STEP_NOCB(
    ux_idle_flow_5_step,
    bn,
    {
      "Copyright",
      "(c) 2024 Ledger",
    });
UX_STEP_VALID(
    ux_idle_flow_6_step,
    pb,
    os_sched_exit(-1),
    {
      &C_icon_dashboard_x,
      "Quit",
    });

UX_FLOW(ux_idle_flow,
  &ux_idle_flow_1_step,
  &ux_idle_flow_2_step,
  &ux_idle_flow_3_step,
  &ux_idle_flow_4_step,
  &ux_idle_flow_5_step,
  &ux_idle_flow_6_step,
  FLOW_LOOP
);

void ui_idle(void) {
    // reserve a display stack slot if none yet
    if(G_ux.stack_count == 0) {
        ux_stack_push();
    }
    ux_flow_init(0, ux_idle_flow, NULL);
}
#endif // HAVE_BAGL
