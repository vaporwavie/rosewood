#pragma once

#include "RosewoodSourceTextRunShadowNode.h"

#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace facebook::react {
using RosewoodSourceTextRunComponentDescriptor =
    ConcreteComponentDescriptor<RosewoodSourceTextRunShadowNode>;

void RosewoodSourceTextRunSpec_registerComponentDescriptorsFromCodegen(
    std::shared_ptr<const ComponentDescriptorProviderRegistry> registry);
} // namespace facebook::react
