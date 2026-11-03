#include "RosewoodSourceTextShadowNode.h"
#include "RosewoodSourceTextRunShadowNode.h"
#include <react/renderer/components/view/ViewShadowNode.h>
#import <react/renderer/textlayoutmanager/RCTAttributedTextUtils.h>

#include <algorithm>
#include <cmath>

namespace facebook::react {

RosewoodSourceTextShadowNode::RosewoodSourceTextShadowNode(
    const ShadowNode &sourceShadowNode, const ShadowNodeFragment &fragment)
    : ConcreteViewShadowNode(sourceShadowNode, fragment){};

Size RosewoodSourceTextShadowNode::measureContent(
    const LayoutContext &layoutContext,
    const LayoutConstraints &layoutConstraints) const {
  const auto &baseProps = getConcreteProps();

  auto baseTextAttributes = TextAttributes::defaultTextAttributes();
  baseTextAttributes.backgroundColor = baseProps.backgroundColor;
  baseTextAttributes.allowFontScaling = baseProps.allowFontScaling;

  Float fontSizeMultiplier = 1.0;
  if (baseTextAttributes.allowFontScaling) {
    fontSizeMultiplier = layoutContext.fontSizeMultiplier;
  }

  auto baseAttributedString = AttributedString{};
  const auto &children = getChildren();
  for (size_t i = 0; i < children.size(); i++) {
    const auto child = children[i].get();
    if (auto textViewChild =
            dynamic_cast<const RosewoodSourceTextRunShadowNode *>(child)) {
      auto &props = textViewChild->getConcreteProps();
      auto fragment = AttributedString::Fragment{};
      auto textAttributes = TextAttributes::defaultTextAttributes();

      textAttributes.allowFontScaling = baseProps.allowFontScaling;
      textAttributes.backgroundColor = props.backgroundColor;
      textAttributes.fontSize = props.fontSize * fontSizeMultiplier;
      textAttributes.lineHeight = props.lineHeight * fontSizeMultiplier;
      textAttributes.foregroundColor = props.color;
      textAttributes.textShadowColor = props.shadowColor;
      textAttributes.textShadowOffset = props.shadowOffset;
      textAttributes.textShadowRadius = props.shadowRadius;
      textAttributes.letterSpacing = props.letterSpacing;
      textAttributes.textDecorationColor = props.textDecorationColor;
      textAttributes.fontFamily = props.fontFamily;

      if (props.fontStyle == RosewoodSourceTextRunFontStyle::Italic) {
        textAttributes.fontStyle = FontStyle::Italic;
      } else {
        textAttributes.fontStyle = FontStyle::Normal;
      }

      if (props.fontWeight == RosewoodSourceTextRunFontWeight::Bold) {
        textAttributes.fontWeight = FontWeight::Bold;
      } else if (props.fontWeight == RosewoodSourceTextRunFontWeight::UltraLight) {
        textAttributes.fontWeight = FontWeight::UltraLight;
      } else if (props.fontWeight == RosewoodSourceTextRunFontWeight::Light) {
        textAttributes.fontWeight = FontWeight::Light;
      } else if (props.fontWeight == RosewoodSourceTextRunFontWeight::Medium) {
        textAttributes.fontWeight = FontWeight::Medium;
      } else if (props.fontWeight == RosewoodSourceTextRunFontWeight::Semibold) {
        textAttributes.fontWeight = FontWeight::Semibold;
      } else if (props.fontWeight == RosewoodSourceTextRunFontWeight::Heavy) {
        textAttributes.fontWeight = FontWeight::Heavy;
      } else {
        textAttributes.fontWeight = FontWeight::Regular;
      }

      if (props.textDecorationLine ==
          RosewoodSourceTextRunTextDecorationLine::LineThrough) {
        textAttributes.textDecorationLineType =
            TextDecorationLineType::Strikethrough;
      } else if (props.textDecorationLine ==
                 RosewoodSourceTextRunTextDecorationLine::Underline) {
        textAttributes.textDecorationLineType =
            TextDecorationLineType::Underline;
      } else {
        textAttributes.textDecorationLineType = TextDecorationLineType::None;
      }

      if (props.textDecorationStyle ==
          RosewoodSourceTextRunTextDecorationStyle::Solid) {
        textAttributes.textDecorationStyle = TextDecorationStyle::Solid;
      } else if (props.textDecorationStyle ==
                 RosewoodSourceTextRunTextDecorationStyle::Dotted) {
        textAttributes.textDecorationStyle = TextDecorationStyle::Dotted;
      } else if (props.textDecorationStyle ==
                 RosewoodSourceTextRunTextDecorationStyle::Dashed) {
        textAttributes.textDecorationStyle = TextDecorationStyle::Dashed;
      } else if (props.textDecorationStyle ==
                 RosewoodSourceTextRunTextDecorationStyle::Double) {
        textAttributes.textDecorationStyle = TextDecorationStyle::Double;
      }

      if (props.textAlign == RosewoodSourceTextRunTextAlign::Left) {
        textAttributes.alignment = TextAlignment::Left;
      } else if (props.textAlign == RosewoodSourceTextRunTextAlign::Right) {
        textAttributes.alignment = TextAlignment::Right;
      } else if (props.textAlign == RosewoodSourceTextRunTextAlign::Center) {
        textAttributes.alignment = TextAlignment::Center;
      } else if (props.textAlign == RosewoodSourceTextRunTextAlign::Justify) {
        textAttributes.alignment = TextAlignment::Justified;
      } else if (props.textAlign == RosewoodSourceTextRunTextAlign::Auto) {
        textAttributes.alignment = TextAlignment::Natural;
      }

      textAttributes.backgroundColor = props.backgroundColor;

      fragment.string = props.text;
      fragment.textAttributes = textAttributes;

      baseAttributedString.appendFragment(std::move(fragment));
    }
  }

  _attributedString = baseAttributedString;

  NSMutableAttributedString *convertedAttributedString =
      [RCTNSAttributedStringFromAttributedString(baseAttributedString)
          mutableCopy];
  // Match React Native's baseline offset in both measurement and rendering.
  RCTApplyBaselineOffset(convertedAttributedString);

  const CGFloat maximumWidth =
      std::isfinite(layoutConstraints.maximumSize.width)
          ? layoutConstraints.maximumSize.width
          : CGFLOAT_MAX;
  NSTextStorage *textStorage = [[NSTextStorage alloc]
      initWithAttributedString:convertedAttributedString];
  NSLayoutManager *layoutManager = [[NSLayoutManager alloc] init];
  layoutManager.usesFontLeading = NO;
  NSTextContainer *textContainer = [[NSTextContainer alloc]
      initWithSize:CGSizeMake(maximumWidth, CGFLOAT_MAX)];
  textContainer.lineFragmentPadding = 0;
  textContainer.maximumNumberOfLines = baseProps.numberOfLines;
  if (baseProps.ellipsizeMode == RosewoodSourceTextEllipsizeMode::Head) {
    textContainer.lineBreakMode = NSLineBreakByTruncatingHead;
  } else if (baseProps.ellipsizeMode == RosewoodSourceTextEllipsizeMode::Middle) {
    textContainer.lineBreakMode = NSLineBreakByTruncatingMiddle;
  } else if (baseProps.ellipsizeMode == RosewoodSourceTextEllipsizeMode::Tail) {
    textContainer.lineBreakMode = NSLineBreakByTruncatingTail;
  } else {
    textContainer.lineBreakMode = NSLineBreakByClipping;
  }
  [layoutManager addTextContainer:textContainer];
  [textStorage addLayoutManager:layoutManager];
  [layoutManager ensureLayoutForTextContainer:textContainer];
  const CGRect usedRect =
      [layoutManager usedRectForTextContainer:textContainer];

  return {
      std::clamp(static_cast<Float>(std::ceil(usedRect.size.width)),
                 layoutConstraints.minimumSize.width,
                 layoutConstraints.maximumSize.width),
      std::clamp(static_cast<Float>(std::ceil(usedRect.size.height)),
                 layoutConstraints.minimumSize.height,
                 layoutConstraints.maximumSize.height),
  };
}

void RosewoodSourceTextShadowNode::layout(LayoutContext layoutContext) {
  ensureUnsealed();
  setStateData(RosewoodSourceTextStateReal{
      _attributedString,
  });
}
} // namespace facebook::react
