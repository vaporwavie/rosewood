#import "RosewoodSourceTextRun.h"
#import <React/RCTFabricComponentsPlugins.h>
#import "RosewoodSourceTextRunComponentDescriptor.h"
#import <react/renderer/components/RosewoodSourceTextSpec/Props.h>
#import <react/renderer/components/RosewoodSourceTextSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RosewoodSourceTextRun () <RCTT3SourceTextRunViewProtocol>

@end

@implementation RosewoodSourceTextRun {
  NSString *_text;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<
      RosewoodSourceTextRunComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps =
        std::make_shared<const RosewoodSourceTextRunProps>();
    _props = defaultProps;
  }
  return self;
}

- (void)updateProps:(Props::Shared const &)props
           oldProps:(Props::Shared const &)oldProps {
  const auto &oldViewProps =
      *std::static_pointer_cast<RosewoodSourceTextRunProps const>(_props);
  const auto &newViewProps =
      *std::static_pointer_cast<RosewoodSourceTextRunProps const>(props);

  if (newViewProps.text != oldViewProps.text) {
    NSString *text = [NSString stringWithUTF8String:newViewProps.text.c_str()];
    _text = text;
  }

  [super updateProps:props oldProps:oldProps];
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

Class<RCTComponentViewProtocol> RosewoodSourceTextRunCls(void) {
  return RosewoodSourceTextRun.class;
}

@end
