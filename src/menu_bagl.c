#ifdef HAVE_BAGL
#include "menu.h"

#ifndef PRODUCTION_BUILD
#define PRODUCTION_BUILD 0
#endif

static char blindsign_text[20];

bool is_blindsign_enabled(void) {
    return N_storage.blindsign_enabled == 0x01;
}

void toggle_blindsign(void) {
    uint8_t value = N_storage.blindsign_enabled ? 0x00 : 0x01;
    nvm_write((void*)&N_storage.blindsign_enabled, &value, sizeof(value));
}

static void update_blindsign_text(void) {
    if (is_blindsign_enabled()) {
        strcpy(blindsign_text, "Enabled");
    } else {
        strcpy(blindsign_text, "Disabled");
    }
}

#ifdef HAVE_ON_DEVICE_UNIT_TESTS
UX_STEP_NOCB(
    ux_idle_flow_1_step,
    pnn,
    {
      &C_mina_logo,
      "Mina",
      "unit tests",
    });
#elif (PRODUCTION_BUILD == 0)
UX_STEP_NOCB(
    ux_idle_flow_1_step,
    pnn,
    {
      &C_mina_logo,
      "Mina DEMO",
      "DO NOT USE",
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
      "Zondax AG",
    });
UX_STEP_NOCB(
    ux_idle_flow_4_step,
    bn,
    {
      "Copyright",
      "(c) 2024 Ledger",
    });
UX_STEP_CB_INIT(
    ux_idle_flow_blindsign_step,
    bn,
    update_blindsign_text(),
    toggle_blindsign(); ui_idle();,
    {
      "Blind signing",
      blindsign_text,
    });
UX_STEP_VALID(
    ux_idle_flow_5_step,
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
  &ux_idle_flow_blindsign_step,
  &ux_idle_flow_5_step,
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
