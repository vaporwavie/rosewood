#pragma once

#include <react/renderer/components/RosewoodSourceTextSpec/EventEmitters.h>
#include <react/renderer/components/RosewoodSourceTextSpec/Props.h>
#include <react/renderer/components/RosewoodSourceTextSpec/States.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

namespace facebook::react {
extern const char RosewoodSourceTextRunComponentName[];

using RosewoodSourceTextRunShadowNode =
    ConcreteViewShadowNode<RosewoodSourceTextRunComponentName, RosewoodSourceTextRunProps,
                           RosewoodSourceTextRunEventEmitter, RosewoodSourceTextRunState>;
} // namespace facebook::react
