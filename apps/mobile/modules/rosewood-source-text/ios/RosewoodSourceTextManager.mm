#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RosewoodSourceTextManager : RCTViewManager
@end

@implementation RosewoodSourceTextManager

RCT_EXPORT_MODULE(RosewoodSourceText)

- (UIView *)view {
  return [[UIView alloc] init];
}

@end

@interface RosewoodSourceTextRunManager : RCTViewManager
@end

@implementation RosewoodSourceTextRunManager

RCT_EXPORT_MODULE(RosewoodSourceTextRun)

- (UIView *)view {
  return nil;
}

@end
