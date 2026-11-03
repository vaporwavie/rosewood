#pragma once

#include <react/renderer/components/RosewoodSourceTextSpec/EventEmitters.h>
#include <react/renderer/components/RosewoodSourceTextSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>
#include <react/renderer/core/ShadowNode.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>

namespace facebook::react {

extern const char RosewoodSourceTextComponentName[];

class RosewoodSourceTextStateReal final {
public:
  AttributedString attributedString;
};

class RosewoodSourceTextShadowNode final
    : public ConcreteViewShadowNode<RosewoodSourceTextComponentName,
                                    RosewoodSourceTextProps, RosewoodSourceTextEventEmitter,
                                    RosewoodSourceTextStateReal> {
public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  RosewoodSourceTextShadowNode(const ShadowNode &sourceShadowNode,
                         const ShadowNodeFragment &fragment);

  static ShadowNodeTraits BaseTraits() {
    auto traits = ConcreteViewShadowNode::BaseTraits();
    traits.set(ShadowNodeTraits::Trait::LeafYogaNode);
    traits.set(ShadowNodeTraits::Trait::MeasurableYogaNode);
    return traits;
  }

  void layout(LayoutContext layoutContext) override;

  Size
  measureContent(const LayoutContext &layoutContext,
                 const LayoutConstraints &layoutConstraints) const override;

private:
  mutable AttributedString _attributedString;
};
} // namespace facebook::react
