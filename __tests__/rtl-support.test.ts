/**
 * @ldesign/i18n - RTL Support Tests
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  DirectionManager,
  LocaleMetadataManager,
  RTLCSSHelper,
  isRTL,
  isLTR,
  getDirection
} from '../src/utils/locale-metadata';

describe('DirectionManager', () => {
  beforeEach(() => {
    DirectionManager.clearCache();
  });

  it('should detect RTL languages', () => {
    expect(DirectionManager.isRTL('ar')).toBe(true);
    expect(DirectionManager.isRTL('he')).toBe(true);
    expect(DirectionManager.isRTL('fa')).toBe(true);
    expect(DirectionManager.isRTL('ur')).toBe(true);
  });

  it('should detect LTR languages', () => {
    expect(DirectionManager.isLTR('en')).toBe(true);
    expect(DirectionManager.isLTR('zh-CN')).toBe(true);
    expect(DirectionManager.isLTR('es')).toBe(true);
    expect(DirectionManager.isLTR('fr')).toBe(true);
  });

  it('should get correct direction', () => {
    expect(DirectionManager.getDirection('ar')).toBe('rtl');
    expect(DirectionManager.getDirection('en')).toBe('ltr');
    expect(DirectionManager.getDirection('ar-SA')).toBe('rtl');
    expect(DirectionManager.getDirection('en-US')).toBe('ltr');
  });

  it('should cache direction results', () => {
    const dir1 = DirectionManager.getDirection('ar');
    const dir2 = DirectionManager.getDirection('ar');

    expect(dir1).toBe(dir2);
  });

  it('should export convenience functions', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isLTR('en')).toBe(true);
    expect(getDirection('ar')).toBe('rtl');
  });
});

describe('LocaleMetadataManager', () => {
  beforeEach(() => {
    LocaleMetadataManager.clearCache();
  });

  it('should get complete metadata', () => {
    const metadata = LocaleMetadataManager.getMetadata('ar');

    expect(metadata).toMatchObject({
      locale: 'ar',
      direction: 'rtl',
      script: 'arabic',
      numberSystem: 'arabic-indic'
    });
  });

  it('should get metadata for Chinese', () => {
    const metadata = LocaleMetadataManager.getMetadata('zh-CN');

    expect(metadata).toMatchObject({
      locale: 'zh-CN',
      direction: 'ltr',
      script: 'cjk',
      numberSystem: 'chinese'
    });
  });

  it('should get script type', () => {
    expect(LocaleMetadataManager.getScript('ar')).toBe('arabic');
    expect(LocaleMetadataManager.getScript('he')).toBe('hebrew');
    expect(LocaleMetadataManager.getScript('ru')).toBe('cyrillic');
    expect(LocaleMetadataManager.getScript('zh')).toBe('cjk');
    expect(LocaleMetadataManager.getScript('en')).toBe('latin');
  });

  it('should get number system', () => {
    expect(LocaleMetadataManager.getNumberSystem('ar')).toBe('arabic-indic');
    expect(LocaleMetadataManager.getNumberSystem('hi')).toBe('devanagari');
    expect(LocaleMetadataManager.getNumberSystem('zh')).toBe('chinese');
    expect(LocaleMetadataManager.getNumberSystem('en')).toBe('western');
  });

  it('should get native names', () => {
    expect(LocaleMetadataManager.getNativeName('ar')).toBe('العربية');
    expect(LocaleMetadataManager.getNativeName('zh-CN')).toBe('简体中文');
    expect(LocaleMetadataManager.getNativeName('en')).toBe('English');
  });

  it('should allow custom metadata registration', () => {
    LocaleMetadataManager.registerMetadata('custom-lang', {
      direction: 'rtl',
      script: 'arabic',
      nativeName: 'Custom Language'
    });

    const metadata = LocaleMetadataManager.getMetadata('custom-lang');
    expect(metadata.nativeName).toBe('Custom Language');
  });
});

describe('RTLCSSHelper', () => {
  it('should generate direction-specific class', () => {
    expect(RTLCSSHelper.getDirectionClass('ar', 'button')).toBe('button--rtl');
    expect(RTLCSSHelper.getDirectionClass('en', 'button')).toBe('button--ltr');
  });

  it('should convert logical spacing to physical', () => {
    // RTL: start = right, end = left
    expect(RTLCSSHelper.getSpacingClass('ar', 'margin', 'start', '10'))
      .toBe('margin-right-10');
    expect(RTLCSSHelper.getSpacingClass('ar', 'margin', 'end', '10'))
      .toBe('margin-left-10');

    // LTR: start = left, end = right
    expect(RTLCSSHelper.getSpacingClass('en', 'margin', 'start', '10'))
      .toBe('margin-left-10');
    expect(RTLCSSHelper.getSpacingClass('en', 'margin', 'end', '10'))
      .toBe('margin-right-10');
  });

  it('should handle top/bottom spacing', () => {
    expect(RTLCSSHelper.getSpacingClass('ar', 'padding', 'top', '20'))
      .toBe('padding-top-20');
    expect(RTLCSSHelper.getSpacingClass('en', 'padding', 'bottom', '20'))
      .toBe('padding-bottom-20');
  });

  it('should generate flex direction class', () => {
    expect(RTLCSSHelper.getFlexDirectionClass('ar', 'row')).toBe('flex-row-reverse');
    expect(RTLCSSHelper.getFlexDirectionClass('en', 'row')).toBe('flex-row');
    expect(RTLCSSHelper.getFlexDirectionClass('ar', 'column')).toBe('flex-column');
  });

  it('should generate text alignment class', () => {
    expect(RTLCSSHelper.getTextAlignClass('ar', 'start')).toBe('text-right');
    expect(RTLCSSHelper.getTextAlignClass('ar', 'end')).toBe('text-left');
    expect(RTLCSSHelper.getTextAlignClass('en', 'start')).toBe('text-left');
    expect(RTLCSSHelper.getTextAlignClass('en', 'end')).toBe('text-right');
    expect(RTLCSSHelper.getTextAlignClass('ar', 'center')).toBe('text-center');
  });
});

