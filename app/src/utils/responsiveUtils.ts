import { Dimensions } from 'react-native';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

export const getResponsiveValues = () => {
    const isSmallScreen = DEVICE_WIDTH < 360;
    const isMediumScreen = DEVICE_WIDTH >= 360 && DEVICE_WIDTH < 400;
    const isTablet = DEVICE_WIDTH >= 768;

    return {
        padding: isSmallScreen ? 12 : 16,
        headerSpacing: isSmallScreen ? 12 : 20,
        calendarHeight: isTablet ? '50%' : DEVICE_HEIGHT < 700 ? '55%' : '60%',
        dayFontSize: isSmallScreen ? 11 : 12,
        headerButtonMinWidth: isSmallScreen ? 70 : 90,
        modalMaxHeight: DEVICE_HEIGHT * 0.85,
        gridGap: isSmallScreen ? 4 : 8,
        isSmallScreen,
        isMediumScreen,
        isTablet,
    };
};