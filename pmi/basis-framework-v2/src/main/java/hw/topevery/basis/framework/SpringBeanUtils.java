package hw.topevery.basis.framework;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.stereotype.Service;

@Service
public class SpringBeanUtils implements BeanFactoryAware {

    private static BeanFactory beanFactory;

    /**
     * 注入sring的BeanFactory实例
     */
    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        SpringBeanUtils.beanFactory = beanFactory;
    }

    /**
     * 根据bean的名称获取相应类型的对象
     *
     * @param beanName bean的名称
     * @return Object类型的对象
     */
    public static Object getBean(String beanName) {
        return beanFactory.getBean(beanName);
    }

    /**
     * 根据bean的Class获取相应类型的对象
     *
     * @return Object类型的对象
     */
    public static <T> T getBean(Class<T> clazz) {
        return beanFactory.getBean(clazz);
    }
}
