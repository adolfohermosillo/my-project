library(ggplot2)
library(tidyverse)
library(lme4)
library(wesanderson)
library(languageR)
#importing data set

data <- read_csv(file = '/Users/jesushermosillo/Desktop/Spring 2021/LINGUIST_245B/variable_telicity/data/experiment_01/variable_telicity_and_verbs_of_consumption-merged.csv')


#labels for plots
data$levels <- sprintf('level %d',data$state) #level 1, level 2, ..., etc
data$QDO_maximality <- factor(ifelse(data$maximality == 'maximal', 'Maximal', 'Non-Maximal'))


# exclude participants who fail to correctly answer control items
exclude_by_control <- data[data$item_type =='control' & data$response =='TRUE' , ]$workerid
data_ <- data[is.element(data$workerid,exclude_by_control) == FALSE,]

# exclude participants whose response to baseline is FALSE
exclude_by_baseline <- data_[data_$item_type =='baseline' & data_$response == 'FALSE', ]$workerid
data_1  <- data_[is.element(data_$workerid,exclude_by_baseline) == FALSE,]


#number of participants after exclusions
length(unique(unique(data_1$workerid)))



#Plotting proportion of responses by event progression levels 
ggplot(data_1,aes( x = levels,fill = response)) + 
  geom_bar( position = "fill") + 
  theme_bw() + scale_fill_brewer(palette = "Paired")  + 
  labs(x = "Event Progression Levels", fill = 'Response', y ='Proportion of Responses') 

#Plotting proportion of responses by object maximality
ggplot(data_1,aes( x = QDO_maximality,fill = response)) + 
  geom_bar( position = "fill") + 
  theme_bw() + scale_fill_brewer(palette = "Paired")  + 
  labs(x = "Object Maximality", fill = 'Response', y ='Proportion of Responses') 



#Plotting proportion of responses by event progression levels for maximal and non-maximal objects 
ggplot(data_1, aes( x = levels,fill = response)) + 
  geom_bar( position = "fill") + 
  facet_grid(~QDO_maximality) + 
  theme_bw() + scale_fill_brewer(palette = "Paired")  + 
  labs(x = "Event Progression Levels", fill = 'Response', y ='Proportion of Responses') 




# critical data points
data_critical =  data_1[data_1$item_type =='critical',]

data_critical = data_critical %>% mutate(numeric_DO = as.numeric((data_critical$QDO_maximality))) %>% mutate (centered_QDOM = numeric_DO - mean(numeric_DO))

data_critical = data_critical %>% mutate(numeric_EP = as.numeric((data_critical$state))) %>% mutate (centered_state = numeric_EP - mean(numeric_EP))

# model does not converge
# Fixed effects: state + object maximality (both centered), 
# Random effects: object maximality slopes and participant and item intercepts  
model_0 = glmer(response ~  centered_state * centered_QDOM + (1 + centered_QDOM |workerid)  + (1 + centered_QDOM |item)   , data=data_critical, family="binomial")
summary(model_0)

# model does not converge
model_1 = glmer(response ~  centered_state * centered_QDOM + (1  |workerid)  + (1 + centered_QDOM |item)   , data=data_critical, family="binomial")
summary(model_1)

# model does not converge
model_2 = glmer(response ~  centered_state * centered_QDOM + (1 + centered_QDOM |workerid)  + (1  |item)   , data=data_critical, family="binomial")
summary(model_2)

# model does not converge
model_3= glmer(response ~  centered_state * centered_QDOM + (1  |workerid)  + (1  |item)   , data=data_critical, family="binomial")
summary(model_3)

# model CONVERGES!!!!
model_4 = glmer(response ~  centered_state * centered_QDOM + (1  |workerid)    , data=data_critical, family="binomial")
summary(model_4)

# model does not converge
model_4 = glmer(response ~  centered_state * centered_QDOM + (1 + centered_QDOM |workerid )    , data=data_critical, family="binomial")
summary(model_4)


# model CONVERGES!!!!
model_5 = glmer(response ~  centered_state * centered_QDOM   + (1 |item)   , data=data_critical, family="binomial")
summary(model_5)


# final model 
summary(model_4)



